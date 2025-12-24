import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/notifications/debug
 * Debug endpoint to check notification status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get user preferences
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        role: true,
        subscriptionTier: true,
        inAppNotifications: true,
        notifyBetaAccess: true,
        notifyGameUpdates: true,
        notifyFeedbackResponse: true,
        notifyAchievements: true,
        notifySubscription: true,
      },
    });

    // Get total gamers count
    const totalGamers = await prisma.user.count({
      where: { role: 'GAMER' },
    });

    // Get recent beta games
    const recentBetaGames = await prisma.game.findMany({
      where: { releaseStatus: 'BETA' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        releaseStatus: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: user?.email,
        role: user?.role,
        subscriptionTier: user?.subscriptionTier,
        preferences: {
          inAppNotifications: user?.inAppNotifications,
          notifyBetaAccess: user?.notifyBetaAccess,
          notifyGameUpdates: user?.notifyGameUpdates,
          notifyFeedbackResponse: user?.notifyFeedbackResponse,
          notifyAchievements: user?.notifyAchievements,
          notifySubscription: user?.notifySubscription,
        },
      },
      notifications: {
        total: notifications.length,
        recent: notifications,
      },
      stats: {
        totalGamers,
        recentBetaGames,
      },
    });
  } catch (error: any) {
    console.error('Debug notifications error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to debug notifications' },
      { status: 500 }
    );
  }
}



