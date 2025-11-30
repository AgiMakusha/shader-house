import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/beta/my-tests
 * Get user's active beta tests with progress
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tests = await prisma.betaTester.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
            releaseStatus: true,
            externalUrl: true,
            gameFileUrl: true,
            developer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        completedTasks: {
          include: {
            task: true,
          },
        },
      },
      orderBy: {
        lastActiveAt: 'desc',
      },
    });

    // Get total tasks and verified completions for each game
    const testsWithProgress = await Promise.all(
      tests.map(async (test) => {
        const totalTasks = await prisma.betaTask.count({
          where: { gameId: test.gameId },
        });

        // Count verified task completions for this user
        const verifiedCompletions = await prisma.betaTaskCompletion.count({
          where: {
            userId: session.user.id,
            task: {
              gameId: test.gameId,
            },
            status: 'VERIFIED',
          },
        });

        return {
          ...test,
          totalTasks,
          tasksCompleted: verifiedCompletions, // Override with actual verified count
          progress: totalTasks > 0 ? (verifiedCompletions / totalTasks) * 100 : 0,
        };
      })
    );

    return NextResponse.json({ tests: testsWithProgress });
  } catch (error: any) {
    console.error('GET /api/beta/my-tests error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch beta tests' },
      { status: 500 }
    );
  }
}

