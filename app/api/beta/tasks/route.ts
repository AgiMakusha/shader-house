import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

/**
 * POST /api/beta/tasks
 * Create a new task for a beta game
 * Developer only
 */

const createTaskSchema = z.object({
  gameId: z.string(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['BUG_REPORT', 'SUGGESTION', 'PLAY_LEVEL', 'TEST_FEATURE']),
  xpReward: z.number().int().min(0).max(1000).default(50),
  rewardPoints: z.number().int().min(0).max(100).default(10),
  isOptional: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createTaskSchema.parse(body);

    // Verify game ownership
    const game = await prisma.game.findUnique({
      where: { id: validated.gameId },
      select: { id: true, developerId: true },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.developerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the game owner can create tasks' },
        { status: 403 }
      );
    }

    // Get the current max order for this game
    const maxOrderTask = await prisma.betaTask.findFirst({
      where: { gameId: validated.gameId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const nextOrder = (maxOrderTask?.order ?? -1) + 1;

    // Create task
    const task = await prisma.betaTask.create({
      data: {
        gameId: validated.gameId,
        title: validated.title,
        description: validated.description,
        type: validated.type,
        xpReward: validated.xpReward,
        rewardPoints: validated.rewardPoints,
        isOptional: validated.isOptional,
        order: nextOrder,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/beta/tasks error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}

