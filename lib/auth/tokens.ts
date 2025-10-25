import { prisma } from '@/lib/db/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function generateVerificationToken(userId: string, type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' = 'EMAIL_VERIFICATION') {
  const token = uuidv4();
  const expiresInHours = type === 'EMAIL_VERIFICATION' ? 24 : 1; // 24 hours for email, 1 hour for password reset
  const expires = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  // Delete any existing tokens for this user and type
  await prisma.verificationToken.deleteMany({
    where: {
      userId,
      type,
    },
  });

  // Create new token
  const verificationToken = await prisma.verificationToken.create({
    data: {
      userId,
      token,
      type,
      expires,
    },
  });

  return verificationToken;
}

export async function verifyToken(token: string, type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' = 'EMAIL_VERIFICATION') {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verificationToken) {
    return { valid: false, error: 'Invalid token' };
  }

  if (verificationToken.type !== type) {
    return { valid: false, error: 'Invalid token type' };
  }

  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    return { valid: false, error: 'Token has expired' };
  }

  return { valid: true, userId: verificationToken.userId, user: verificationToken.user };
}

export async function deleteToken(token: string) {
  try {
    await prisma.verificationToken.delete({
      where: { token },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function markEmailAsVerified(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });

  // Delete all email verification tokens for this user
  await prisma.verificationToken.deleteMany({
    where: {
      userId,
      type: 'EMAIL_VERIFICATION',
    },
  });
}

