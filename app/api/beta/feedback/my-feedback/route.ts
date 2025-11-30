import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/beta/feedback/my-feedback
 * Get gamer's own feedback for a specific game
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

    // Get all feedback submitted by this gamer for this game
    const feedback = await prisma.betaFeedback.findMany({
      where: {
        testerId: tester.id,
        gameId,
      },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        status: true,
        severity: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ feedback });
  } catch (error: any) {
    console.error('GET /api/beta/feedback/my-feedback error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

