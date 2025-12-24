import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET - Verify email change token and update email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const newEmail = searchParams.get('email');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!token || !newEmail) {
      return NextResponse.redirect(
        `${baseUrl}/profile/gamer/settings?error=invalid_token`
      );
    }

    // Find and validate token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        `${baseUrl}/profile/gamer/settings?error=invalid_token`
      );
    }

    if (verificationToken.type !== 'EMAIL_CHANGE') {
      return NextResponse.redirect(
        `${baseUrl}/profile/gamer/settings?error=invalid_token`
      );
    }

    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.redirect(
        `${baseUrl}/profile/gamer/settings?error=token_expired`
      );
    }

    // Check if email is still available
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail.toLowerCase() },
    });

    if (existingUser && existingUser.id !== verificationToken.userId) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.redirect(
        `${baseUrl}/profile/gamer/settings?error=email_taken`
      );
    }

    // Update user email
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { 
        email: newEmail.toLowerCase(),
        emailVerified: new Date(),
      },
    });

    // Delete the token
    await prisma.verificationToken.delete({ where: { token } });

    // Redirect to settings with success message
    const redirectPath = verificationToken.user.role === 'DEVELOPER' 
      ? '/profile/developer/settings' 
      : '/profile/gamer/settings';
    
    return NextResponse.redirect(
      `${baseUrl}${redirectPath}?success=email_changed`
    );
  } catch (error) {
    console.error("Email verification error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${baseUrl}/profile/gamer/settings?error=verification_failed`
    );
  }
}



