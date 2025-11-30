import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/beta/stats
 * Get beta testing statistics for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's XP and points directly from User model
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        xp: true,
        points: true,
      },
    });

    // Get all beta tester records for this user
    const betaTesters = await prisma.betaTester.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            coverUrl: true,
          },
        },
      },
    });

    // Count verified task completions
    const verifiedCompletions = await prisma.betaTaskCompletion.count({
      where: {
        userId: session.user.id,
        status: 'VERIFIED',
      },
    });

    // Count bugs reported (feedback with type BUG)
    const bugsReported = await prisma.betaFeedback.count({
      where: {
        tester: {
          userId: session.user.id,
        },
        type: 'BUG',
      },
    });

    // Calculate totals
    const totalXP = user?.xp || 0;
    const totalPoints = user?.points || 0;
    const totalTasksCompleted = verifiedCompletions;
    const totalBugsReported = bugsReported;
    const totalGamesTested = betaTesters.length;

    // Get active tests count
    const activeTests = betaTesters.filter((t) => t.lastActiveAt).length;

    return NextResponse.json({
      stats: {
        totalXP,
        totalPoints,
        totalTasksCompleted,
        totalBugsReported,
        totalGamesTested,
        activeTests,
      },
    });
  } catch (error: any) {
    console.error('GET /api/beta/stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch beta stats' },
      { status: 500 }
    );
  }
}

