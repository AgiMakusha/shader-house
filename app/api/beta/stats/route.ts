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
        taskCompletions: {
          include: {
            task: {
              select: {
                xpReward: true,
                rewardPoints: true,
              },
            },
          },
        },
      },
    });

    // Calculate totals
    let totalXP = 0;
    let totalPoints = 0;
    let totalTasksCompleted = 0;
    let totalBugsReported = 0;
    let totalGamesTested = betaTesters.length;

    betaTesters.forEach((tester) => {
      totalTasksCompleted += tester.tasksCompleted;
      totalBugsReported += tester.bugsReported;

      // Sum up XP and points from completed tasks
      tester.taskCompletions.forEach((completion) => {
        totalXP += completion.task.xpReward;
        totalPoints += completion.task.rewardPoints;
      });
    });

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
      recentGames: betaTesters.slice(0, 5).map((t) => ({
        id: t.game.id,
        title: t.game.title,
        coverUrl: t.game.coverUrl,
        tasksCompleted: t.tasksCompleted,
        bugsReported: t.bugsReported,
      })),
    });
  } catch (error: any) {
    console.error('GET /api/beta/stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch beta stats' },
      { status: 500 }
    );
  }
}

