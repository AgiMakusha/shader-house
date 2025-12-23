import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { notifyAchievementUnlocked } from '@/lib/notifications/triggers';

/**
 * POST /api/achievements/sync
 * Sync unlocked achievements to user's badges array
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Achievements are only for gamers, not developers
    if (session.user.role !== 'GAMER') {
      return NextResponse.json({
        success: true,
        badges: [],
        unlocked: [],
        message: 'Achievements are only available for gamers',
      });
    }

    // Fetch various stats for achievements
    const [
      reviewsCount,
      betaTestsCount,
      gamesAccessedCount,
      favoritesCount,
    ] = await Promise.all([
      // Count reviews (ratings with comments)
      prisma.rating.count({
        where: {
          userId: session.user.id,
          comment: {
            not: null,
          },
        },
      }),
      // Count beta tests joined
      prisma.betaTester.count({
        where: {
          userId: session.user.id,
        },
      }),
      // Count games accessed (played/downloaded)
      prisma.gameAccess.count({
        where: {
          userId: session.user.id,
        },
      }),
      // Count favorited games
      prisma.favorite.count({
        where: {
          userId: session.user.id,
        },
      }),
    ]);

    // Determine which achievements are unlocked
    const unlockedAchievements: string[] = [];
    
    if (gamesAccessedCount > 0) {
      unlockedAchievements.push('first-steps');
    }
    
    if (favoritesCount > 0) {
      unlockedAchievements.push('collector');
    }
    
    if (betaTestsCount >= 5) {
      unlockedAchievements.push('game-tester');
    }
    
    if (reviewsCount >= 10) {
      unlockedAchievements.push('community-leader');
    }
    
    if (gamesAccessedCount > 0 && betaTestsCount >= 5 && reviewsCount >= 10) {
      unlockedAchievements.push('legend');
    }

    // Get current user badges
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { badges: true },
    });

    const currentBadges = user?.badges || [];
    
    // Normalize existing badges to standard format (first-steps, collector, etc.)
    const normalizedCurrentBadges = currentBadges.map(badge => {
      const lower = badge.toLowerCase().trim();
      // Map common variations to standard format
      if (lower.includes('first') && (lower.includes('step') || lower.includes('steps'))) {
        return 'first-steps';
      }
      if (lower.includes('collector')) {
        return 'collector';
      }
      if (lower.includes('game') && lower.includes('test')) {
        return 'game-tester';
      }
      if (lower.includes('community') && lower.includes('leader')) {
        return 'community-leader';
      }
      if (lower.includes('legend')) {
        return 'legend';
      }
      return badge; // Keep as-is if no match
    });
    
    // Merge unlocked achievements with existing badges (avoid duplicates)
    const updatedBadges = [...new Set([...normalizedCurrentBadges, ...unlockedAchievements])];

    // Find newly unlocked achievements (not in previous badges)
    const newlyUnlocked = unlockedAchievements.filter(
      achievement => !normalizedCurrentBadges.includes(achievement)
    );

    // Update user's badges array
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        badges: updatedBadges,
      },
    });

    // Send notifications for newly unlocked achievements
    const { getBadgeName, getBadgeDescription } = await import('@/lib/badges/mappings');
    for (const achievementId of newlyUnlocked) {
      try {
        const achievementName = getBadgeName(achievementId);
        const achievementDescription = getBadgeDescription(achievementId);
        await notifyAchievementUnlocked(
          session.user.id,
          achievementId,
          achievementName,
          achievementDescription
        );
      } catch (notificationError) {
        console.error(`Error sending notification for achievement ${achievementId}:`, notificationError);
        // Don't fail the request if notification fails
      }
    }

    console.log('🏆 Synced badges for user:', session.user.email, {
      previousBadges: currentBadges,
      newBadges: updatedBadges,
      unlockedAchievements,
    });

    return NextResponse.json({
      success: true,
      badges: updatedBadges,
      unlocked: unlockedAchievements,
    });
  } catch (error: any) {
    console.error('POST /api/achievements/sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync achievements' },
      { status: 500 }
    );
  }
}
