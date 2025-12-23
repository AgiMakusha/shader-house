import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/beta/stats
 * Get beta testing statistics for the current user
 * 
 * Returns:
 * - totalXP: XP earned ONLY from verified beta task completions
 * - totalPoints: Points earned ONLY from verified beta task completions
 * - totalTasksCompleted: Count of verified beta tasks
 * - totalBugsReported: Count of bug reports submitted
 * - totalGamesTested: Count of beta games participated in
 * - activeTests: Count of currently active beta tests
 * 
 * Note: This does NOT include XP/Points from discussions, achievements, or other sources.
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
      },
    });

    // Get all VERIFIED task completions with their rewards
    const verifiedCompletions = await prisma.betaTaskCompletion.findMany({
      where: {
        userId: session.user.id,
        status: 'VERIFIED',
      },
      include: {
        task: {
          select: {
            xpReward: true,
            rewardPoints: true,
          },
        },
      },
    });

    // Calculate XP and Points ONLY from beta testing
    const betaXP = verifiedCompletions.reduce(
      (sum, completion) => sum + (completion.task.xpReward || 0),
      0
    );
    const betaPoints = verifiedCompletions.reduce(
      (sum, completion) => sum + (completion.task.rewardPoints || 0),
      0
    );

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
    const totalXP = betaXP;
    const totalPoints = betaPoints;
    const totalTasksCompleted = verifiedCompletions.length;
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

