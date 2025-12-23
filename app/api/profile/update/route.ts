import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  // Basic profile fields
  displayName: z.union([z.string().min(2).max(50), z.literal('')]).optional(),
  publicEmail: z.union([z.string().email(), z.literal('')]).optional(),
  bio: z.union([z.string().max(500), z.literal('')]).optional(),
  // Accept either a full URL, a relative path starting with /, or an empty string
  image: z.union([z.string().url(), z.string().startsWith('/'), z.literal('')]).optional(),
  
  // User preferences
  wantsNewsletter: z.boolean().optional(),
  wantsDigestNewsletter: z.boolean().optional(),
  showOnlineStatus: z.boolean().optional(),
  statusMessage: z.union([z.string().max(100), z.literal('')]).optional(),
  
  // Notification preferences
  emailNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
  notifyBetaAccess: z.boolean().optional(),
  notifyFeedbackResponse: z.boolean().optional(),
  notifyGameUpdates: z.boolean().optional(),
  notifyAchievements: z.boolean().optional(),
  notifySubscription: z.boolean().optional(),
  notifyDevlogs: z.boolean().optional(),
  
  // Developer communication preferences
  acceptCollabRequests: z.boolean().optional(),
  receiveLaunchUpdates: z.boolean().optional(),
  preferredContactNotes: z.union([z.string().max(500), z.literal('')]).optional(),
  
  // Developer studio profile
  studioName: z.union([z.string().min(1).max(100), z.literal('')]).optional(),
  tools: z.union([z.string().max(500), z.literal('')]).optional(),
  portfolioUrl: z.union([z.string().url(), z.literal('')]).optional(),
  studioBio: z.union([z.string().max(1000), z.literal('')]).optional(),
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

    // Build user update data
    const userUpdateData: any = {};
    if (validated.displayName !== undefined) {
      userUpdateData.displayName = validated.displayName || null;
    }
    if (validated.publicEmail !== undefined) {
      userUpdateData.publicEmail = validated.publicEmail || null;
    }
    if (validated.bio !== undefined) {
      userUpdateData.bio = validated.bio || null;
    }
    if (validated.image !== undefined) {
      userUpdateData.image = validated.image || null;
    }
    if (validated.wantsNewsletter !== undefined) {
      userUpdateData.wantsNewsletter = validated.wantsNewsletter;
    }
    if (validated.wantsDigestNewsletter !== undefined) {
      userUpdateData.wantsDigestNewsletter = validated.wantsDigestNewsletter;
    }
    if (validated.showOnlineStatus !== undefined) {
      userUpdateData.showOnlineStatus = validated.showOnlineStatus;
    }
    if (validated.statusMessage !== undefined) {
      userUpdateData.statusMessage = validated.statusMessage || null;
    }
    if (validated.emailNotifications !== undefined) {
      userUpdateData.emailNotifications = validated.emailNotifications;
    }
    if (validated.inAppNotifications !== undefined) {
      userUpdateData.inAppNotifications = validated.inAppNotifications;
    }
    if (validated.notifyBetaAccess !== undefined) {
      userUpdateData.notifyBetaAccess = validated.notifyBetaAccess;
    }
    if (validated.notifyFeedbackResponse !== undefined) {
      userUpdateData.notifyFeedbackResponse = validated.notifyFeedbackResponse;
    }
    if (validated.notifyGameUpdates !== undefined) {
      userUpdateData.notifyGameUpdates = validated.notifyGameUpdates;
    }
    if (validated.notifyAchievements !== undefined) {
      userUpdateData.notifyAchievements = validated.notifyAchievements;
    }
    if (validated.notifySubscription !== undefined) {
      userUpdateData.notifySubscription = validated.notifySubscription;
    }
    if (validated.notifyDevlogs !== undefined) {
      userUpdateData.notifyDevlogs = validated.notifyDevlogs;
    }
    if (validated.acceptCollabRequests !== undefined) {
      userUpdateData.acceptCollabRequests = validated.acceptCollabRequests;
    }
    if (validated.receiveLaunchUpdates !== undefined) {
      userUpdateData.receiveLaunchUpdates = validated.receiveLaunchUpdates;
    }
    if (validated.preferredContactNotes !== undefined) {
      userUpdateData.preferredContactNotes = validated.preferredContactNotes || null;
    }

    // Update user - only select fields we need for the response
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: userUpdateData,
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        publicEmail: true,
        bio: true,
        image: true,
        role: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        level: true,
        points: true,
        badges: true,
        createdAt: true,
      },
    });

    // Build developer profile update data (only if user is developer and fields are provided)
    const developerProfileUpdateData: any = {};
    if (session.user.role === 'DEVELOPER') {
      if (validated.studioName !== undefined) {
        developerProfileUpdateData.studioName = validated.studioName || null;
      }
      if (validated.tools !== undefined) {
        developerProfileUpdateData.tools = validated.tools || null;
      }
      if (validated.portfolioUrl !== undefined) {
        developerProfileUpdateData.portfolioUrl = validated.portfolioUrl || null;
      }
      if (validated.studioBio !== undefined) {
        developerProfileUpdateData.studioBio = validated.studioBio || null;
      }

      // Update developer profile if there are changes
      // Only update studio profile fields, don't touch verification data
      if (Object.keys(developerProfileUpdateData).length > 0) {
        const existingProfile = await prisma.developerProfile.findUnique({
          where: { userId: session.user.id },
        });

        if (existingProfile) {
          // Update existing profile with only studio fields
          await prisma.developerProfile.update({
            where: { userId: session.user.id },
            data: developerProfileUpdateData,
          });
        }
        // If profile doesn't exist, we skip updating studio fields
        // (developer should have completed verification first)
      }
    }

    // Return the updated user (Prisma will return all fields, we'll filter on client if needed)
    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}





