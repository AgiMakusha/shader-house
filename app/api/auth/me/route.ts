import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get session from request
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user from database with developer profile and accounts if applicable
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        developerProfile: true,
        accounts: {
          select: {
            id: true,
            provider: true,
            type: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return user data (excluding password)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        developerProfile: user.developerProfile,
        // Subscription fields
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionStart: user.subscriptionStart,
        subscriptionEnd: user.subscriptionEnd,
        // Progression fields
        xp: user.xp,
        level: user.level,
        points: user.points,
        badges: user.badges,
        // Public profile fields
        displayName: user.displayName,
        publicEmail: user.publicEmail,
        bio: user.bio,
        // User preferences
        wantsNewsletter: user.wantsNewsletter,
        wantsDigestNewsletter: user.wantsDigestNewsletter,
        showOnlineStatus: user.showOnlineStatus,
        statusMessage: user.statusMessage,
        // Developer communication preferences
        acceptCollabRequests: user.acceptCollabRequests,
        receiveLaunchUpdates: user.receiveLaunchUpdates,
        preferredContactNotes: user.preferredContactNotes,
        // Notification preferences
        emailNotifications: user.emailNotifications,
        inAppNotifications: user.inAppNotifications,
        notifyBetaAccess: user.notifyBetaAccess,
        notifyFeedbackResponse: user.notifyFeedbackResponse,
        notifyGameUpdates: user.notifyGameUpdates,
        notifyAchievements: user.notifyAchievements,
        notifySubscription: user.notifySubscription,
        notifyDevlogs: user.notifyDevlogs,
        // Two-Factor Authentication
        twoFactorEnabled: user.twoFactorEnabled,
        // Linked accounts (OAuth)
        accounts: user.accounts,
        // Has password (for account security display)
        hasPassword: !!user.password,
      },
    });

  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user profile" },
      { status: 500 }
    );
  }
}

