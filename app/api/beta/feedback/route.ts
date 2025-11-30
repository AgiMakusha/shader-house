import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const feedbackSchema = z.object({
  gameId: z.string(),
  type: z.enum(['BUG', 'SUGGESTION', 'GENERAL']),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  screenshot: z.string().optional(), // Base64 or URL
  deviceInfo: z.string().optional(),
});

/**
 * POST /api/beta/feedback
 * Submit feedback/bug report
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = feedbackSchema.parse(body);

    // Check if user is a beta tester for this game
    const tester = await prisma.betaTester.findUnique({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId: validated.gameId,
        },
      },
    });

    if (!tester) {
      return NextResponse.json(
        { error: 'You must join the beta test before submitting feedback' },
        { status: 403 }
      );
    }

    // Create feedback
    const feedback = await prisma.betaFeedback.create({
      data: {
        testerId: tester.id,
        gameId: validated.gameId,
        type: validated.type,
        title: validated.title,
        description: validated.description,
        severity: validated.severity || (validated.type === 'BUG' ? 'MEDIUM' : null),
        screenshot: validated.screenshot,
        deviceInfo: validated.deviceInfo,
      },
      include: {
        tester: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Update tester stats
    if (validated.type === 'BUG') {
      await prisma.betaTester.update({
        where: { id: tester.id },
        data: {
          bugsReported: {
            increment: 1,
          },
          lastActiveAt: new Date(),
        },
      });
    }

    // Auto-complete relevant tasks based on feedback type
    let taskType: 'BUG_REPORT' | 'SUGGESTION' | null = null;
    if (validated.type === 'BUG') {
      taskType = 'BUG_REPORT';
    } else if (validated.type === 'SUGGESTION') {
      taskType = 'SUGGESTION';
    }

    const tasksToComplete = taskType
      ? await prisma.betaTask.findMany({
          where: {
            gameId: validated.gameId,
            type: taskType,
          },
          select: { id: true },
        })
      : [];

    // Mark tasks as complete if not already completed
    for (const task of tasksToComplete) {
      const existingCompletion = await prisma.betaTaskCompletion.findUnique({
        where: {
          taskId_testerId: {
            taskId: task.id,
            testerId: tester.id,
          },
        },
      });

      if (!existingCompletion) {
        await prisma.betaTaskCompletion.create({
          data: {
            taskId: task.id,
            testerId: tester.id,
            isVerified: false, // Developer can verify later
          },
        });

        // Increment tasks completed count
        await prisma.betaTester.update({
          where: { id: tester.id },
          data: {
            tasksCompleted: {
              increment: 1,
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback,
      tasksCompleted: tasksToComplete.length,
    });
  } catch (error: any) {
    console.error('POST /api/beta/feedback error:', error);
    console.error('Error stack:', error.stack);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || 'Failed to submit feedback',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/beta/feedback?gameId=xxx
 * Get feedback for a game (developer only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    // Check if user is the game developer
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { developerId: true },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.developerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the game developer can view feedback' },
        { status: 403 }
      );
    }

    // Get all feedback for the game
    const feedback = await prisma.betaFeedback.findMany({
      where: { gameId },
      include: {
        tester: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get stats
    const stats = {
      total: feedback.length,
      bugs: feedback.filter((f) => f.type === 'BUG').length,
      suggestions: feedback.filter((f) => f.type === 'SUGGESTION').length,
      new: feedback.filter((f) => f.status === 'NEW').length,
      inProgress: feedback.filter((f) => f.status === 'IN_PROGRESS').length,
      resolved: feedback.filter((f) => f.status === 'RESOLVED').length,
    };

    return NextResponse.json({ feedback, stats });
  } catch (error: any) {
    console.error('GET /api/beta/feedback error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

