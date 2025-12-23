import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSessionFromRequest } from '@/lib/auth/session';

// GET - Fetch developer's own games
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Check if user is a developer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== 'DEVELOPER') {
      return NextResponse.json(
        { error: 'Only developers can access this' },
        { status: 403 }
      );
    }

    const games = await prisma.game.findMany({
      where: { developerId: userId },
      select: {
        id: true,
        title: true,
        slug: true,
        coverUrl: true,
        releaseStatus: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error fetching developer games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}
