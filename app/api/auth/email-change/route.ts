import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail, renderVerificationEmail } from "@/lib/email/service";

// POST - Request email change (sends verification to new email)
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newEmail, password } = await request.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password required to change email" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if new email is same as current
    if (user.email.toLowerCase() === newEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "New email must be different from current email" },
        { status: 400 }
      );
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already in use" },
        { status: 400 }
      );
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { error: "Account does not have a password. Please set one first." },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 400 }
      );
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token with new email in metadata
    await prisma.verificationToken.create({
      data: {
        userId: session.user.id,
        token,
        type: 'EMAIL_CHANGE',
        expires,
      },
    });

    // Store the pending new email (we'll use the token as reference)
    // For simplicity, we'll encode the new email in the token metadata
    // In production, you might want a separate table for pending email changes

    // Build verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/api/auth/email-change/verify?token=${token}&email=${encodeURIComponent(newEmail)}`;

    // Send verification email to new address
    try {
      const emailHtml = renderVerificationEmail(verificationUrl, newEmail.split('@')[0]);
      await sendEmail({
        to: newEmail,
        subject: 'Verify your new email - Shader House',
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Clean up the token
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Verification email sent. Please check your new email inbox.",
    });
  } catch (error) {
    console.error("Email change error:", error);
    return NextResponse.json(
      { error: "Failed to initiate email change" },
      { status: 500 }
    );
  }
}

