import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  publicEmail: z.string().email().optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = profileUpdateSchema.parse(body);

    // Convert empty strings to null for database
    const updateData: any = {};
    if (validated.displayName !== undefined) {
      updateData.displayName = validated.displayName || null;
    }
    if (validated.publicEmail !== undefined) {
      updateData.publicEmail = validated.publicEmail || null;
    }
    if (validated.bio !== undefined) {
      updateData.bio = validated.bio || null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        publicEmail: true,
        bio: true,
        role: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

