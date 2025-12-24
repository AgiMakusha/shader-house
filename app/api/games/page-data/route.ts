import { NextRequest, NextResponse } from 'next/server';
import { getGames, getTags } from '@/lib/queries/games';
import { gameQuerySchema } from '@/lib/validations/game';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { ReleaseStatus } from '@prisma/client';

/**
 * GET /api/games/page-data
 * PERFORMANCE FIX: Combined endpoint that returns all games page data in one request
 * 
 * Previously required 3 separate API calls:
 * - /api/games - Main games list
 * - /api/games/featured - Featured carousel
 * - /api/games/trending - Trending sidebar
 * 
 * This reduces network overhead and improves page load performance
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const { searchParams } = new URL(request.url);
    
    const queryParams = {
      q: searchParams.get('q') || undefined,
      tags: searchParams.get('tags') || undefined,
      platform: searchParams.get('platform') || undefined,
      priceFilter: searchParams.get('priceFilter') || undefined,
      sort: searchParams.get('sort') || undefined,
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
      developer: searchParams.get('developer') || undefined,
    };

    const validated = gameQuerySchema.parse(queryParams);
    
    // Pass userId if developer='me' is requested
    const userId = validated.developer === 'me' ? session?.user?.id : undefined;
    
    // Check status filter
    const statusParam = searchParams.get('status');
    
    const isMyGames = validated.developer === 'me';
    const hasFilters = queryParams.q || queryParams.tags;

    // Fetch all data in parallel for maximum performance
    const [gamesResult, tags, featuredGames, trendingGames] = await Promise.all([
      // Main games list
      getGames(validated, userId, statusParam),
      
      // All available tags
      getTags(),
      
      // Featured games (only if not viewing "My Games" and no search filters)
      !isMyGames && !hasFilters
        ? prisma.game.findMany({
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
            take: 5,
          })
        : Promise.resolve([]),
      
      // Trending games (only if not viewing "My Games" and no search filters)
      // Use the cached trendingScore from database instead of calculating in real-time
      !isMyGames && !hasFilters
        ? prisma.game.findMany({
            where: {
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
              _count: {
                select: {
                  ratings: true,
                  favorites: true,
                },
              },
            },
            orderBy: [
              { trendingScore: 'desc' },
              { views: 'desc' },
            ],
            take: 5,
          })
        : Promise.resolve([]),
    ]);

    // Format featured games
    const formattedFeatured = featuredGames.map(game => ({
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
      tags: game.gameTags.map((gt: any) => ({
        id: gt.tag.id,
        name: gt.tag.name,
        slug: gt.tag.slug,
      })),
      _count: game._count,
    }));

    // Format trending games
    const formattedTrending = trendingGames.map((game, index) => ({
      rank: index + 1,
      id: game.id,
      slug: game.slug,
      title: game.title,
      tagline: game.tagline,
      coverUrl: game.coverUrl,
      priceCents: game.priceCents,
      avgRating: game.avgRating,
      isFeatured: game.isFeatured,
      developer: game.developer,
      trendingScore: game.trendingScore,
      _count: game._count,
    }));

    return NextResponse.json({
      // Main games list
      items: gamesResult.items,
      total: gamesResult.total,
      page: gamesResult.page,
      totalPages: gamesResult.totalPages,
      pageSize: gamesResult.pageSize,
      
      // Tags for filtering
      tags,
      
      // Featured games carousel
      featured: formattedFeatured,
      
      // Trending games sidebar
      trending: formattedTrending,
    });
  } catch (error: any) {
    console.error('GET /api/games/page-data error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch games page data' },
      { status: 400 }
    );
  }
}

