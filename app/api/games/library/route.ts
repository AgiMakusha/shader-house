import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'purchased' | 'favorites' | null (both)

    // Get purchased games
    let purchasedGames: any[] = [];
    if (!type || type === 'purchased') {
      const purchases = await prisma.purchase.findMany({
        where: { userId },
        include: {
          game: {
            include: {
              developer: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              gameTags: {
                include: {
                  tag: true,
                },
              },
              _count: {
                select: {
                  ratings: true,
                  favorites: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      purchasedGames = purchases.map((p) => ({
        ...p.game,
        purchasedAt: p.createdAt,
        pricePaid: p.pricePaid,
      }));
    }

    // Get favorited games
    let favoritedGames: any[] = [];
    if (!type || type === 'favorites') {
      const favorites = await prisma.favorite.findMany({
        where: { userId },
        include: {
          game: {
            include: {
              developer: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              gameTags: {
                include: {
                  tag: true,
                },
              },
              _count: {
                select: {
                  ratings: true,
                  favorites: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      favoritedGames = favorites.map((f) => ({
        ...f.game,
        favoritedAt: f.createdAt,
      }));
    }

    // Check which favorited games are also purchased
    const purchasedGameIds = new Set(purchasedGames.map((g) => g.id));
    favoritedGames = favoritedGames.map((game) => ({
      ...game,
      isPurchased: purchasedGameIds.has(game.id),
    }));

    return NextResponse.json({
      purchased: purchasedGames,
      favorites: favoritedGames,
      stats: {
        purchasedCount: purchasedGames.length,
        favoritesCount: favoritedGames.length,
      },
    });
  } catch (error: any) {
    console.error('Library API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch library' },
      { status: 500 }
    );
  }
}

