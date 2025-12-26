import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/auth/validation";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/rate-limit";
import { quickBotCheck } from "@/lib/security/bot-detection";
import { logSecurityEvent } from "@/lib/security/audit-log";
import bcrypt from "bcryptjs";

// Rate limit config: 5 failed attempts per 15 minutes per IP/email
const LOGIN_RATE_LIMIT = { maxRequests: 5, windowMs: 15 * 60 * 1000 };
// Stricter limit for repeated failures from same IP
const IP_RATE_LIMIT = { maxRequests: 20, windowMs: 15 * 60 * 1000 };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get client info for rate limiting
    const clientIP = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";
    const userAgent = request.headers.get("user-agent");
    
    // Check IP-based rate limit first (broader protection)
    const ipRateLimit = checkRateLimit(`login-ip:${clientIP}`, IP_RATE_LIMIT);
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Too many login attempts from this IP. Please try again later.",
          retryAfter: new Date(ipRateLimit.resetAt).toISOString()
        },
        { status: 429 }
      );
    }
    
    // Bot detection check (honeypot + behavioral signals)
    const botCheck = quickBotCheck(
      body.behavioralSignals || null,
      body.honeypot ? {
        website: body.honeypot.username, // Map username honeypot to website field
        _formTimestamp: body.honeypot._formTimestamp,
        _formToken: body.honeypot._formToken,
      } : null
    );
    
    if (botCheck.isBot) {
      logSecurityEvent('LOGIN_BLOCKED_BOT', {
        ipAddress: clientIP,
        userAgent: userAgent || undefined,
        endpoint: '/api/auth/login',
        details: { reason: botCheck.reason },
        success: false,
      });
      return NextResponse.json(
        { error: "Suspicious activity detected. Please try again." },
        { status: 403 }
      );
    }
    
    // Validate input
    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check email+IP specific rate limit (more targeted)
    const clientId = getClientIdentifier(clientIP, userAgent, normalizedEmail);
    const emailRateLimit = checkRateLimit(`login-email:${clientId}`, LOGIN_RATE_LIMIT);
    
    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Too many failed login attempts. Please try again in 15 minutes or reset your password.",
          retryAfter: new Date(emailRateLimit.resetAt).toISOString()
        },
        { status: 429 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        subscriptionTier: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      // Tell user no account exists - they need to sign up first
      return NextResponse.json(
        { error: "No account found with this email. Please sign up first to create an account." },
        { status: 404 }
      );
    }

    // Check if user has a password (OAuth users might not)
    if (!user.password) {
      return NextResponse.json(
        { error: "This account uses social login. Please sign in with your connected provider." },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      logSecurityEvent('LOGIN_FAILURE', {
        userId: user.id,
        ipAddress: clientIP,
        userAgent: userAgent || undefined,
        endpoint: '/api/auth/login',
        details: { reason: 'Invalid password' },
        success: false,
      });
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Log successful login
    logSecurityEvent('LOGIN_SUCCESS', {
      userId: user.id,
      ipAddress: clientIP,
      userAgent: userAgent || undefined,
      endpoint: '/api/auth/login',
      details: { rememberMe },
      success: true,
    });

    // Create session
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "DEVELOPER" | "GAMER" | "ADMIN",
      subscriptionTier: user.subscriptionTier as "FREE" | "CREATOR_SUPPORT" | "GAMER_PRO",
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt.getTime(),
    }, rememberMe);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}

