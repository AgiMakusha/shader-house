import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';

    let orderBy: any = { createdAt: 'desc' };

    switch (filter) {
      case 'popular':
        orderBy = { avgRating: 'desc' };
        break;
      case 'new':
        orderBy = { createdAt: 'desc' };
        break;
      case 'hidden':
        // Hidden gems: good rating but lower view count
        orderBy = [{ avgRating: 'desc' }, { views: 'asc' }];
        break;
    }

    const proLibraryGames = await prisma.proLibraryGame.findMany({
      include: {
        game: {
          include: {
            developer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy:
        filter === 'new'
          ? { addedAt: 'desc' }
          : filter === 'all'
          ? { addedAt: 'desc' }
          : undefined,
    });

    let games = proLibraryGames.map((plg) => plg.game);

    // Apply additional sorting for popular and hidden
    if (filter === 'popular') {
      games = games.sort((a, b) => b.avgRating - a.avgRating);
    } else if (filter === 'hidden') {
      games = games
        .filter((g) => g.avgRating >= 4.0)
        .sort((a, b) => a.views - b.views);
    }

    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error fetching Pro Library games:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}








