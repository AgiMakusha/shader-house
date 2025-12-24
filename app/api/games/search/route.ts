import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ReleaseStatus, Platform } from '@prisma/client';

/**
 * GET /api/games/search
 * Full-text search with relevance scoring
 * 
 * Query params:
 * - q: Search query (required)
 * - tags: Comma-separated tag slugs (optional)
 * - platform: Platform filter (optional)
 * - priceFilter: 'free' | 'paid' | 'all' (optional)
 * - sort: 'relevance' | 'new' | 'popular' | 'rating' (default: relevance)
 * - page: Page number (default: 1)
 * - pageSize: Results per page (default: 12, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || '';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const platform = searchParams.get('platform') as Platform | null;
    const priceFilter = searchParams.get('priceFilter') || 'all';
    const sort = searchParams.get('sort') || 'relevance';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '12', 10)));
    
    if (!query.trim() && tags.length === 0) {
      return NextResponse.json(
        { error: 'Search query or tags required' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * pageSize;

    // Build the search with relevance scoring
    // We'll use a combination of factors to calculate relevance:
    // 1. Title match (highest weight)
    // 2. Tagline match (medium weight)
    // 3. Description match (lower weight)
    // 4. Tag match (bonus)
    // 5. Developer name match (small bonus)

    // For PostgreSQL, we can use ts_rank for full-text search
    // But for simplicity, we'll use a simpler approach with LIKE and scoring

    const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 1);
    
    // First, get all released games that might match
    const baseWhere: any = {
      releaseStatus: ReleaseStatus.RELEASED,
    };

    // Platform filter
    if (platform) {
      baseWhere.platforms = { has: platform };
    }

    // Price filter
    if (priceFilter === 'free') {
      baseWhere.priceCents = 0;
    } else if (priceFilter === 'paid') {
      baseWhere.priceCents = { gt: 0 };
    }

    // Tag filter
    if (tags.length > 0) {
      baseWhere.gameTags = {
        some: {
          tag: {
            slug: { in: tags },
          },
        },
      };
    }

    // Get games with potential matches
    let games = await prisma.game.findMany({
      where: baseWhere,
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

    // Calculate relevance score for each game
    const scoredGames = games.map(game => {
      let relevanceScore = 0;
      const titleLower = game.title.toLowerCase();
      const taglineLower = game.tagline.toLowerCase();
      const descriptionLower = game.description.toLowerCase();
      const developerLower = game.developer.name.toLowerCase();
      const gameTags = game.gameTags.map(gt => gt.tag.slug.toLowerCase());

      for (const term of searchTerms) {
        // Title match (highest priority - 100 points for exact, 50 for contains)
        if (titleLower === term) {
          relevanceScore += 100;
        } else if (titleLower.includes(term)) {
          relevanceScore += 50;
        } else if (titleLower.split(/\s+/).some(word => word.startsWith(term))) {
          relevanceScore += 30;
        }

        // Tagline match (40 points)
        if (taglineLower.includes(term)) {
          relevanceScore += 40;
        }

        // Description match (10 points per occurrence, max 30)
        const descMatches = (descriptionLower.match(new RegExp(term, 'g')) || []).length;
        relevanceScore += Math.min(30, descMatches * 10);

        // Developer name match (20 points)
        if (developerLower.includes(term)) {
          relevanceScore += 20;
        }

        // Tag match (25 points per matching tag)
        for (const tag of gameTags) {
          if (tag.includes(term) || term.includes(tag)) {
            relevanceScore += 25;
          }
        }
      }

      // Bonus for popular games (up to 10 points)
      const popularityBonus = Math.min(10, Math.log10((game.views || 0) + 1) * 2);
      relevanceScore += popularityBonus;

      // Bonus for highly rated games (up to 10 points)
      const ratingBonus = (game.avgRating / 5) * 10;
      relevanceScore += ratingBonus;

      // Bonus for recent games (up to 5 points)
      const daysSinceCreation = (Date.now() - game.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const recencyBonus = Math.max(0, 5 - (daysSinceCreation / 30)); // Full bonus for games < 30 days old
      relevanceScore += recencyBonus;

      return {
        ...game,
        relevanceScore: Math.round(relevanceScore * 100) / 100,
      };
    });

    // Filter games with at least some relevance
    let filteredGames = scoredGames.filter(g => g.relevanceScore > 0);

    // Sort based on user preference
    switch (sort) {
      case 'new':
        filteredGames.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'popular':
        filteredGames.sort((a, b) => b.views - a.views);
        break;
      case 'rating':
        filteredGames.sort((a, b) => b.avgRating - a.avgRating);
        break;
      case 'relevance':
      default:
        filteredGames.sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
    }

    // Paginate
    const total = filteredGames.length;
    const paginatedGames = filteredGames.slice(skip, skip + pageSize);

    // Format response
    const results = paginatedGames.map(game => ({
      id: game.id,
      slug: game.slug,
      title: game.title,
      tagline: game.tagline,
      description: game.description.substring(0, 200) + (game.description.length > 200 ? '...' : ''),
      coverUrl: game.coverUrl,
      priceCents: game.priceCents,
      platforms: game.platforms,
      avgRating: game.avgRating,
      views: game.views,
      releaseStatus: game.releaseStatus,
      developer: game.developer,
      tags: game.gameTags.map(gt => ({
        id: gt.tag.id,
        name: gt.tag.name,
        slug: gt.tag.slug,
      })),
      relevanceScore: game.relevanceScore,
      _count: game._count,
      createdAt: game.createdAt,
    }));

    return NextResponse.json({
      query,
      results,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      searchTerms,
      filters: {
        tags,
        platform,
        priceFilter,
        sort,
      },
    });
  } catch (error: any) {
    console.error('GET /api/games/search error:', error);
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}



