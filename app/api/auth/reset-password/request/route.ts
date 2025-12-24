import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateVerificationToken } from '@/lib/auth/tokens';
import { sendPasswordResetEmail } from '@/lib/email/service';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';
import { z } from 'zod';

const requestResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Rate limit config: 3 requests per 15 minutes per IP/email
const RATE_LIMIT_CONFIG = { maxRequests: 3, windowMs: 15 * 60 * 1000 };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validation = requestResetSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();
    
    // Get client info for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent');
    
    // Check rate limit (by IP + email combination)
    const clientId = getClientIdentifier(clientIP, userAgent, normalizedEmail);
    const rateLimit = checkRateLimit(`password-reset:${clientId}`, RATE_LIMIT_CONFIG);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many password reset requests. Please try again later.',
          retryAfter: new Date(rateLimit.resetAt).toISOString()
        },
        { status: 429 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    });

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists and has a password
    if (user && user.password) {
      try {
        // Generate password reset token (expires in 1 hour)
        const token = await generateVerificationToken(user.id, 'PASSWORD_RESET');
        
        // Send password reset email
        await sendPasswordResetEmail(user.email, token.token, user.name);
        
        console.log(`Password reset email sent to: ${user.email}`);
      } catch (error) {
        console.error('Error sending password reset email:', error);
        // Don't expose the error to the user
      }
    } else if (user && !user.password) {
      // User exists but uses OAuth - don't send email but log it
      console.log(`Password reset requested for OAuth user: ${normalizedEmail}`);
    }

    // Always return the same response to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link shortly.',
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}



