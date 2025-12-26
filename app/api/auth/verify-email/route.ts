import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, markEmailAsVerified } from '@/lib/auth/tokens';
import { getSession, createSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify the token
    const result = await verifyToken(token, 'EMAIL_VERIFICATION');

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Mark email as verified
    await markEmailAsVerified(result.userId!);

    // Refresh session if user is logged in
    const session = await getSession();
    if (session && session.user.id === result.userId) {
      // Get updated user data
      const user = await prisma.user.findUnique({
        where: { id: result.userId! },
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

      if (user) {
        // Update session with verified status
        await createSession({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as "DEVELOPER" | "GAMER" | "ADMIN",
          subscriptionTier: user.subscriptionTier as "FREE" | "CREATOR_SUPPORT" | "GAMER_PRO",
          emailVerified: !!user.emailVerified,
          createdAt: user.createdAt.getTime(),
        }, true); // Remember me = true
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred during email verification' },
      { status: 500 }
    );
  }
}

