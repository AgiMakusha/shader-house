import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const updateStatusSchema = z.object({
  feedbackId: z.string().min(1, 'Feedback ID is required'),
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
});

/**
 * PATCH /api/beta/feedback/update-status
 * Update feedback status
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateStatusSchema.parse(body);

    // Check if feedback exists and belongs to developer's game
    const feedback = await prisma.betaFeedback.findUnique({
      where: { id: validated.feedbackId },
      include: {
        game: {
          select: {
            developerId: true,
          },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    if (feedback.game.developerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only update feedback for your own games' },
        { status: 403 }
      );
    }

    // Update feedback status
    const updatedFeedback = await prisma.betaFeedback.update({
      where: { id: validated.feedbackId },
      data: {
        status: validated.status,
      },
    });

    return NextResponse.json({
      message: 'Feedback status updated successfully',
      feedback: updatedFeedback,
    });
  } catch (error: any) {
    console.error('PATCH /api/beta/feedback/update-status error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update feedback status' },
      { status: 500 }
    );
  }
}

