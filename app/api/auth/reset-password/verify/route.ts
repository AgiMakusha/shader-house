import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken, deleteToken } from '@/lib/auth/tokens';
import { passwordSchema } from '@/lib/auth/validation';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Rate limit config: 5 attempts per 15 minutes
const RATE_LIMIT_CONFIG = { maxRequests: 5, windowMs: 15 * 60 * 1000 };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Get client info for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent');
    
    // Check rate limit
    const clientId = getClientIdentifier(clientIP, userAgent);
    const rateLimit = checkRateLimit(`password-reset-verify:${clientId}`, RATE_LIMIT_CONFIG);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many attempts. Please try again later.',
          retryAfter: new Date(rateLimit.resetAt).toISOString()
        },
        { status: 429 }
      );
    }

    // Validate input
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Verify the token
    const tokenResult = await verifyToken(token, 'PASSWORD_RESET');
    
    if (!tokenResult.valid) {
      return NextResponse.json(
        { error: tokenResult.error || 'Invalid or expired reset link' },
        { status: 400 }
      );
    }

    const userId = tokenResult.userId!;

    // Get current user password to ensure new password is different
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (user?.password) {
      const isSamePassword = await bcrypt.compare(password, user.password);
      if (isSamePassword) {
        return NextResponse.json(
          { error: 'New password must be different from your previous password' },
          { status: 400 }
        );
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await deleteToken(token);

    // Also delete any other password reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: {
        userId,
        type: 'PASSWORD_RESET',
      },
    });

    console.log(`Password successfully reset for user: ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully. You can now log in with your new password.',
    });

  } catch (error) {
    console.error('Password reset verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

// GET endpoint to verify token validity without resetting password
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify the token
    const tokenResult = await verifyToken(token, 'PASSWORD_RESET');
    
    if (!tokenResult.valid) {
      return NextResponse.json({
        valid: false,
        error: tokenResult.error || 'Invalid or expired reset link',
      });
    }

    return NextResponse.json({
      valid: true,
      email: tokenResult.user?.email,
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { valid: false, error: 'An error occurred while verifying the token' },
      { status: 500 }
    );
  }
}

