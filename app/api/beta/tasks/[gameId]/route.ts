import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/beta/tasks/:gameId
 * Get tasks for a specific game with completion status
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

    // Get beta tester record
    const tester = await prisma.betaTester.findUnique({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId,
        },
      },
    });

    if (!tester) {
      return NextResponse.json(
        { error: 'You are not enrolled in this beta test' },
        { status: 403 }
      );
    }

    // Get all tasks for the game
    const tasks = await prisma.betaTask.findMany({
      where: { gameId },
      include: {
        completions: {
          where: {
            testerId: tester.id,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Format tasks with completion status
    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      type: task.type,
      completed: task.completions.length > 0,
      completedAt: task.completions[0]?.completedAt || null,
    }));

    return NextResponse.json({ tasks: formattedTasks });
  } catch (error: any) {
    console.error('GET /api/beta/tasks/:gameId error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

