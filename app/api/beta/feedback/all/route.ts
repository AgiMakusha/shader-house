import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/beta/feedback/all
 * Get all feedback across all developer's games
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a developer
    const developer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (developer?.role !== 'DEVELOPER') {
      return NextResponse.json(
        { error: 'Only developers can view feedback' },
        { status: 403 }
      );
    }

    // Get all feedback for all developer's games
    const feedback = await prisma.betaFeedback.findMany({
      where: {
        game: {
          developerId: session.user.id,
        },
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        tester: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform feedback to include user directly
    const transformedFeedback = feedback.map((f) => ({
      ...f,
      user: f.tester.user,
      tester: undefined, // Remove nested tester to avoid confusion
    }));

    return NextResponse.json({ feedback: transformedFeedback });
  } catch (error: any) {
    console.error('GET /api/beta/feedback/all error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}








