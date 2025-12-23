import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/auth/validation";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/rate-limit";
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
        createdAt: true,
      },
    });

    if (!user) {
      // Generic error message to prevent email enumeration
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
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
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "DEVELOPER" | "GAMER" | "ADMIN",
      subscriptionTier: user.subscriptionTier as "FREE" | "CREATOR_SUPPORT" | "GAMER_PRO",
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

