import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, markEmailAsVerified } from '@/lib/auth/tokens';

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

