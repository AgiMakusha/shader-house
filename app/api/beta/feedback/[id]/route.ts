import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
});

/**
 * PATCH /api/beta/feedback/:id
 * Update feedback status (developer only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateSchema.parse(body);

    // Get feedback and check ownership
    const feedback = await prisma.betaFeedback.findUnique({
      where: { id },
      include: {
        game: {
          select: {
            developerId: true,
          },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    if (feedback.game.developerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the game developer can update feedback' },
        { status: 403 }
      );
    }

    // Update feedback
    const updated = await prisma.betaFeedback.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({
      success: true,
      feedback: updated,
    });
  } catch (error: any) {
    console.error('PATCH /api/beta/feedback/:id error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update feedback' },
      { status: 500 }
    );
  }
}

