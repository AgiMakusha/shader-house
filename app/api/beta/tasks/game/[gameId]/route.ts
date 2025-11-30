import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/beta/tasks/game/:gameId
 * Get all tasks for a game (for developer management)
 * Developer only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId } = await params;

    // Verify game ownership
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, developerId: true },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.developerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the game owner can view tasks' },
        { status: 403 }
      );
    }

    // Get all tasks with completion stats
    const tasks = await prisma.betaTask.findMany({
      where: { gameId },
      include: {
        _count: {
          select: {
            completions: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Get total tester count for this game
    const testerCount = await prisma.betaTester.count({
      where: { gameId },
    });

    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      type: task.type,
      xpReward: task.xpReward,
      rewardPoints: task.rewardPoints,
      isOptional: task.isOptional,
      order: task.order,
      completionCount: task._count.completions,
      testerCount,
    }));

    return NextResponse.json({ tasks: formattedTasks, testerCount });
  } catch (error: any) {
    console.error('GET /api/beta/tasks/game/:gameId error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

