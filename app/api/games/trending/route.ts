import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ReleaseStatus } from '@prisma/client';

/**
 * GET /api/games/trending
 * Get trending games based on recent activity
 * 
 * Query params:
 * - limit: Number of games to return (default: 10, max: 50)
 * - period: Time period in days for activity calculation (default: 7)
 * - includeFeatured: Include featured games at the top (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const period = Math.min(90, Math.max(1, parseInt(searchParams.get('period') || '7', 10)));
    const includeFeatured = searchParams.get('includeFeatured') !== 'false';

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Get released games with their recent activity metrics
    const games = await prisma.game.findMany({
      where: {
        releaseStatus: ReleaseStatus.RELEASED,
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
            purchases: true,
          },
        },
      },
    });

    // Calculate trending score for each game
    const scoredGames = await Promise.all(
      games.map(async (game) => {
        // Get recent activity metrics
        const [recentViews, recentFavorites, recentRatings, recentPurchases, recentPlaytime] = 
          await Promise.all([
            // Recent views - we don't track per-day views, so use total views with recency weight
            Promise.resolve(game.views),
            
            // Recent favorites
            prisma.favorite.count({
              where: {
                gameId: game.id,
                createdAt: { gte: startDate },
              },
            }),
            
            // Recent ratings
            prisma.rating.count({
              where: {
                gameId: game.id,
                createdAt: { gte: startDate },
              },
            }),
            
            // Recent purchases
            prisma.purchase.count({
              where: {
                gameId: game.id,
                createdAt: { gte: startDate },
              },
            }),
            
            // Recent playtime sessions
            prisma.playtimeEntry.count({
              where: {
                gameId: game.id,
                sessionDate: { gte: startDate },
              },
            }),
          ]);

        // Calculate trending score based on weighted activity
        // Higher weights for more valuable actions
        const viewsWeight = 1;
        const favoritesWeight = 10;
        const ratingsWeight = 20;
        const purchasesWeight = 50;
        const playtimeWeight = 5;

        // Base activity score
        let activityScore = 
          (recentViews * viewsWeight / 100) + // Normalize views
          (recentFavorites * favoritesWeight) +
          (recentRatings * ratingsWeight) +
          (recentPurchases * purchasesWeight) +
          (recentPlaytime * playtimeWeight);

        // Velocity bonus: recent release gets a boost
        const daysSinceCreation = (Date.now() - game.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation <= 7) {
          activityScore *= 2.0; // Double score for games less than a week old
        } else if (daysSinceCreation <= 14) {
          activityScore *= 1.5; // 50% boost for games less than 2 weeks old
        } else if (daysSinceCreation <= 30) {
          activityScore *= 1.2; // 20% boost for games less than a month old
        }

        // Rating quality bonus
        if (game.avgRating >= 4.5 && game._count.ratings >= 5) {
          activityScore *= 1.3; // 30% boost for highly rated games
        } else if (game.avgRating >= 4.0 && game._count.ratings >= 3) {
          activityScore *= 1.1; // 10% boost for well-rated games
        }

        // Featured bonus
        if (game.isFeatured && includeFeatured) {
          activityScore += 1000; // Featured games get a large boost
        }

        return {
          ...game,
          trendingScore: Math.round(activityScore * 100) / 100,
          recentActivity: {
            favorites: recentFavorites,
            ratings: recentRatings,
            purchases: recentPurchases,
            playSessions: recentPlaytime,
          },
        };
      })
    );

    // Sort by trending score and take top results
    scoredGames.sort((a, b) => b.trendingScore - a.trendingScore);
    const trendingGames = scoredGames.slice(0, limit);

    // Format response
    const results = trendingGames.map((game, index) => ({
      rank: index + 1,
      id: game.id,
      slug: game.slug,
      title: game.title,
      tagline: game.tagline,
      coverUrl: game.coverUrl,
      priceCents: game.priceCents,
      platforms: game.platforms,
      avgRating: game.avgRating,
      views: game.views,
      isFeatured: game.isFeatured,
      developer: game.developer,
      tags: game.gameTags.map(gt => ({
        id: gt.tag.id,
        name: gt.tag.name,
        slug: gt.tag.slug,
      })),
      trendingScore: game.trendingScore,
      recentActivity: game.recentActivity,
      _count: game._count,
      createdAt: game.createdAt,
    }));

    return NextResponse.json({
      trending: results,
      period: {
        days: period,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
      algorithm: {
        description: 'Trending score based on recent favorites, ratings, purchases, and playtime',
        weights: {
          favorites: '10 points each',
          ratings: '20 points each',
          purchases: '50 points each',
          playSessions: '5 points each',
        },
        bonuses: {
          newRelease: 'Up to 2x for games less than a week old',
          highRating: 'Up to 1.3x for games rated 4.5+ with 5+ reviews',
          featured: '+1000 points for featured games',
        },
      },
    });
  } catch (error: any) {
    console.error('GET /api/games/trending error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trending games' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/games/trending/update
 * Manually trigger trending score update for all games (admin only)
 * This can also be called via a cron job
 */
export async function POST(request: NextRequest) {
  try {
    const { getSessionFromRequest } = await import('@/lib/auth/session');
    const session = await getSessionFromRequest(request);

    // Check for admin role or API key
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    const isAdmin = session?.user?.role?.toUpperCase() === 'ADMIN';
    const isCronJob = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isAdmin && !isCronJob) {
      return NextResponse.json(
        { error: 'Only admins can manually update trending scores' },
        { status: 403 }
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Default to 7 days

    // Get all released games
    const games = await prisma.game.findMany({
      where: {
        releaseStatus: ReleaseStatus.RELEASED,
      },
      select: {
        id: true,
        views: true,
        avgRating: true,
        isFeatured: true,
        createdAt: true,
        _count: {
          select: {
            ratings: true,
          },
        },
      },
    });

    // Update trending scores for all games
    let updated = 0;
    for (const game of games) {
      const [recentFavorites, recentRatings, recentPurchases, recentPlaytime] = 
        await Promise.all([
          prisma.favorite.count({
            where: { gameId: game.id, createdAt: { gte: startDate } },
          }),
          prisma.rating.count({
            where: { gameId: game.id, createdAt: { gte: startDate } },
          }),
          prisma.purchase.count({
            where: { gameId: game.id, createdAt: { gte: startDate } },
          }),
          prisma.playtimeEntry.count({
            where: { gameId: game.id, sessionDate: { gte: startDate } },
          }),
        ]);

      let activityScore = 
        (game.views / 100) +
        (recentFavorites * 10) +
        (recentRatings * 20) +
        (recentPurchases * 50) +
        (recentPlaytime * 5);

      const daysSinceCreation = (Date.now() - game.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation <= 7) {
        activityScore *= 2.0;
      } else if (daysSinceCreation <= 14) {
        activityScore *= 1.5;
      } else if (daysSinceCreation <= 30) {
        activityScore *= 1.2;
      }

      if (game.avgRating >= 4.5 && game._count.ratings >= 5) {
        activityScore *= 1.3;
      } else if (game.avgRating >= 4.0 && game._count.ratings >= 3) {
        activityScore *= 1.1;
      }

      if (game.isFeatured) {
        activityScore += 1000;
      }

      await prisma.game.update({
        where: { id: game.id },
        data: {
          trendingScore: Math.round(activityScore * 100) / 100,
          trendingUpdatedAt: new Date(),
        },
      });

      updated++;
    }

    console.log(`🔥 Updated trending scores for ${updated} games`);

    return NextResponse.json({
      success: true,
      gamesUpdated: updated,
      period: {
        days: 7,
        startDate: startDate.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('POST /api/games/trending/update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update trending scores' },
      { status: 500 }
    );
  }
}

