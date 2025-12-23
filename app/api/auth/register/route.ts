import { NextRequest, NextResponse } from "next/server";
import { registerSchema, developerRegistrationSchema } from "@/lib/auth/validation";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { checkIndieEligibility } from "@/lib/indie/eligibility";
import { generateVerificationToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email/service";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { validateEmail } from "@/lib/security/email-validation";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/rate-limit";
import { isLikelyBot, calculateBotScore } from "@/lib/security/behavioral-signals";
import { detectBot, logBotDetection } from "@/lib/security/bot-detection";
import { logSecurityEvent } from "@/lib/security/audit-log";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get client info for security checks
    const clientIP = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";
    const userAgent = request.headers.get("user-agent");
    
    // 1. Rate limiting check
    const clientId = getClientIdentifier(clientIP, userAgent, body.email);
    const rateLimit = checkRateLimit(clientId, { maxRequests: 3, windowMs: 15 * 60 * 1000 });
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Too many registration attempts. Please try again later.",
          retryAfter: new Date(rateLimit.resetAt).toISOString()
        },
        { status: 429 }
      );
    }
    
    // 2. Turnstile verification
    if (body.turnstileToken) {
      const turnstileValid = await verifyTurnstileToken(body.turnstileToken);
      if (!turnstileValid) {
        return NextResponse.json(
          { error: "Security verification failed. Please try again." },
          { status: 400 }
        );
      }
    } else if (process.env.TURNSTILE_SECRET_KEY) {
      // Turnstile is configured but no token provided
      return NextResponse.json(
        { error: "Security verification required." },
        { status: 400 }
      );
    }
    
    // 3. Enhanced bot detection (honeypot, browser fingerprint, behavioral signals)
    // NOTE: Bot detection temporarily disabled to prevent false positives during MVP testing
    // TODO: Re-enable and fine-tune after launch
    const botDetectionResult = detectBot(
      body.behavioralSignals || null,
      body.browserSignals || null,
      body.honeypot || null,
      {
        ip: clientIP,
        userAgent: userAgent || '',
        headers: {
          'accept-language': request.headers.get('accept-language') || undefined,
          'accept-encoding': request.headers.get('accept-encoding') || undefined,
          'accept': request.headers.get('accept') || undefined,
        },
      }
    );
    
    // Log all suspicious activity for monitoring (keep logging for analysis)
    logBotDetection(botDetectionResult, clientIP, '/api/auth/register');
    
    // Log the detection result for debugging
    console.log('[BOT DETECTION DEBUG]', {
      isBot: botDetectionResult.isBot,
      score: botDetectionResult.score,
      confidence: botDetectionResult.confidence,
      category: botDetectionResult.category,
      reasons: botDetectionResult.reasons,
      breakdown: botDetectionResult.breakdown,
    });
    
    // Only block DEFINITE bots (critical confidence) - honeypot triggers
    // Skip blocking for likely_bot to reduce false positives during MVP
    if (botDetectionResult.isBot && botDetectionResult.confidence === 'critical') {
      logSecurityEvent('REGISTER_BLOCKED_BOT', {
        ipAddress: clientIP,
        userAgent: userAgent || undefined,
        endpoint: '/api/auth/register',
        details: {
          score: botDetectionResult.score,
          confidence: botDetectionResult.confidence,
          reasons: botDetectionResult.reasons,
          email: body.email,
        },
        success: false,
      });
      return NextResponse.json(
        { error: "Automated registration detected. Please try again." },
        { status: 403 }
      );
    }
    
    // Legacy behavioral check disabled - too many false positives
    // Keep the code for future use but don't block
    if (body.behavioralSignals) {
      const botScore = calculateBotScore(body.behavioralSignals);
      console.log('[BEHAVIORAL DEBUG]', {
        score: botScore,
        signals: body.behavioralSignals,
        wouldBlock: isLikelyBot(body.behavioralSignals),
      });
      // Disabled blocking - just log for now
      // if (isLikelyBot(body.behavioralSignals)) {
      //   return NextResponse.json(
      //     { error: "Automated registration detected. Please try again." },
      //     { status: 403 }
      //   );
      // }
    }
    
    // Check if this is a developer registration with profile
    const isDeveloperWithProfile = body.role === "developer" && body.developerProfile;
    
    // Validate input
    const validation = isDeveloperWithProfile 
      ? developerRegistrationSchema.safeParse(body)
      : registerSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;
    const developerProfile = isDeveloperWithProfile ? body.developerProfile : null;
    
    // 4. Email validation (disposable email check)
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      logSecurityEvent('REGISTER_BLOCKED_DISPOSABLE_EMAIL', {
        ipAddress: clientIP,
        userAgent: userAgent || undefined,
        endpoint: '/api/auth/register',
        details: { email, reason: emailValidation.reason },
        success: false,
      });
      return NextResponse.json(
        { error: emailValidation.reason },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check indie eligibility if developer profile provided
    let isIndieEligible = false;
    if (developerProfile) {
      const eligibility = checkIndieEligibility({
        teamSize: developerProfile.teamSize,
        hasPublisher: developerProfile.hasPublisher,
        ownsIP: developerProfile.ownsIP,
        companyType: developerProfile.companyType,
        fundingSources: developerProfile.fundingSources,
      });
      isIndieEligible = eligibility.isEligible;
    }

    // Create user in database with developer profile if provided
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role: role.toUpperCase() as "DEVELOPER" | "GAMER",
        ...(developerProfile && {
          developerProfile: {
            create: {
              developerType: developerProfile.developerType,
              teamSize: developerProfile.teamSize,
              hasPublisher: developerProfile.hasPublisher,
              ownsIP: developerProfile.ownsIP,
              fundingSources: developerProfile.fundingSources,
              companyType: developerProfile.companyType,
              evidenceLinks: developerProfile.evidenceLinks,
              attestIndie: developerProfile.attestIndie,
              attestedIP: clientIP,
              isIndieEligible,
              verificationStatus: "PENDING",
            },
          },
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Generate and send email verification token
    try {
      const verificationToken = await generateVerificationToken(newUser.id, 'EMAIL_VERIFICATION');
      await sendVerificationEmail(newUser.email, verificationToken.token, newUser.name);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue with registration even if email fails
    }

    // Log successful registration
    logSecurityEvent('REGISTER_SUCCESS', {
      userId: newUser.id,
      ipAddress: clientIP,
      userAgent: userAgent || undefined,
      endpoint: '/api/auth/register',
      details: { 
        role: newUser.role,
        isDeveloper: role === 'developer',
      },
      success: true,
    });

    // Create session (auto-login after registration)
    await createSession({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as "DEVELOPER" | "GAMER" | "ADMIN",
      subscriptionTier: newUser.subscriptionTier as "FREE" | "CREATOR_SUPPORT" | "GAMER_PRO",
      createdAt: newUser.createdAt.getTime(),
    }, true); // Remember me = true by default for new registrations

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        emailVerified: newUser.emailVerified,
      },
      ...(developerProfile && {
        verificationStatus: "PENDING",
        isIndieEligible,
      }),
      message: "Registration successful! Please check your email to verify your account.",
    });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}

