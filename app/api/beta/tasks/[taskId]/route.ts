import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

/**
 * PATCH /api/beta/tasks/:taskId
 * Update a task
 * Developer only
 */

const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  type: z.enum(['BUG_REPORT', 'SUGGESTION', 'PLAY_LEVEL', 'TEST_FEATURE']).optional(),
  xpReward: z.number().int().min(0).max(1000).optional(),
  rewardPoints: z.number().int().min(0).max(100).optional(),
  isOptional: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = await params;
    const body = await request.json();
    const validated = updateTaskSchema.parse(body);

    // Get task and verify ownership
    const task = await prisma.betaTask.findUnique({
      where: { id: taskId },
      include: {
        game: {
          select: { developerId: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.game.developerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the game owner can update tasks' },
        { status: 403 }
      );
    }

    // Update task
    const updatedTask = await prisma.betaTask.update({
      where: { id: taskId },
      data: validated,
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error: any) {
    console.error('PATCH /api/beta/tasks/:taskId error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/beta/tasks/:taskId
 * Delete a task
 * Developer only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = await params;

    // Get task and verify ownership
    const task = await prisma.betaTask.findUnique({
      where: { id: taskId },
      include: {
        game: {
          select: { developerId: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.game.developerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the game owner can delete tasks' },
        { status: 403 }
      );
    }

    // Delete task (completions will cascade delete)
    await prisma.betaTask.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/beta/tasks/:taskId error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete task' },
      { status: 500 }
    );
  }
}








