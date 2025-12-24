import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { ReleaseStatus } from '@prisma/client';
import { apiCache, CACHE_TTL, CACHE_KEYS } from '@/lib/cache/api-cache';

// PERFORMANCE FIX: Added caching for featured games

/**
 * GET /api/games/featured
 * Get featured games
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '5', 10)));

    // PERFORMANCE FIX: Check cache first
    const cacheKey = CACHE_KEYS.featuredGames(limit);
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache-Status': 'HIT',
        },
      });
    }

    // PERFORMANCE FIX: Filter by publishing fee at database level
    const featuredGames = await prisma.game.findMany({
      where: {
        isFeatured: true,
        releaseStatus: ReleaseStatus.RELEASED,
        publishingFee: {
          paymentStatus: 'completed',
        },
      },
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
      orderBy: [
        { featuredAt: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    const response = {
      featured: featuredGames.map(game => ({
        id: game.id,
        slug: game.slug,
        title: game.title,
        tagline: game.tagline,
        description: game.description.substring(0, 200) + (game.description.length > 200 ? '...' : ''),
        coverUrl: game.coverUrl,
        screenshots: game.screenshots,
        priceCents: game.priceCents,
        platforms: game.platforms,
        avgRating: game.avgRating,
        views: game.views,
        featuredAt: game.featuredAt,
        developer: game.developer,
        tags: game.gameTags.map(gt => ({
          id: gt.tag.id,
          name: gt.tag.name,
          slug: gt.tag.slug,
        })),
        _count: game._count,
      })),
    };

    // PERFORMANCE FIX: Cache the response
    apiCache.set(cacheKey, response, CACHE_TTL.FEATURED_GAMES);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache-Status': 'MISS',
      },
    });
  } catch (error: any) {
    console.error('GET /api/games/featured error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch featured games' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/games/featured
 * Set a game as featured (admin only)
 * 
 * Body: { gameId: string, featured: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can feature games' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { gameId, featured } = body;

    if (!gameId || typeof featured !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: gameId, featured' },
        { status: 400 }
      );
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.releaseStatus !== ReleaseStatus.RELEASED) {
      return NextResponse.json(
        { error: 'Only released games can be featured' },
        { status: 400 }
      );
    }

    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        isFeatured: featured,
        featuredAt: featured ? new Date() : null,
      },
    });

    console.log(`🌟 Game ${game.title} ${featured ? 'featured' : 'unfeatured'} by admin ${session.user.id}`);

    return NextResponse.json({
      success: true,
      game: {
        id: updatedGame.id,
        title: updatedGame.title,
        isFeatured: updatedGame.isFeatured,
        featuredAt: updatedGame.featuredAt,
      },
    });
  } catch (error: any) {
    console.error('POST /api/games/featured error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update featured status' },
      { status: 500 }
    );
  }
}

