import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ReleaseStatus } from '@prisma/client';

// GET /api/games/[id]/similar - Get similar games based on tags and developer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '6', 10), 20);

    // Find the source game
    const sourceGame = await prisma.game.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      include: {
        gameTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!sourceGame) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const tagIds = sourceGame.gameTags.map(gt => gt.tagId);
    const tagSlugs = sourceGame.gameTags.map(gt => gt.tag.slug);

    // Find similar games using a scoring algorithm
    // Score factors:
    // - Shared tags (weighted by number of matching tags)
    // - Same developer (bonus)
    // - Similar price range (small bonus)
    // - Higher ratings (small bonus)
    // - Similar platforms (small bonus)

    // First, get candidate games (must share at least 1 tag OR same developer)
    const candidates = await prisma.game.findMany({
      where: {
        AND: [
          { id: { not: sourceGame.id } }, // Exclude the source game
          { releaseStatus: ReleaseStatus.RELEASED }, // Only released games
          {
            OR: [
              // Share at least one tag
              {
                gameTags: {
                  some: {
                    tagId: { in: tagIds },
                  },
                },
              },
              // Same developer
              { developerId: sourceGame.developerId },
            ],
          },
        ],
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
      take: 50, // Get more candidates to score and filter
    });

    // Score each candidate
    const scoredCandidates = candidates.map(game => {
      let score = 0;

      // Tag matching (0-100 points based on percentage of matching tags)
      const gameTags = game.gameTags.map(gt => gt.tagId);
      const matchingTags = gameTags.filter(t => tagIds.includes(t));
      const tagMatchRatio = tagIds.length > 0 
        ? matchingTags.length / tagIds.length 
        : 0;
      score += tagMatchRatio * 100;

      // Same developer bonus (30 points)
      if (game.developerId === sourceGame.developerId) {
        score += 30;
      }

      // Price similarity bonus (up to 15 points)
      const priceDiff = Math.abs(game.priceCents - sourceGame.priceCents);
      const priceScore = Math.max(0, 15 - (priceDiff / 100)); // Loses 1 point per dollar difference
      score += priceScore;

      // Rating bonus (up to 10 points)
      score += (game.avgRating / 5) * 10;

      // Platform similarity (up to 10 points)
      const sharedPlatforms = game.platforms.filter(p => 
        sourceGame.platforms.includes(p)
      );
      const platformScore = sourceGame.platforms.length > 0
        ? (sharedPlatforms.length / sourceGame.platforms.length) * 10
        : 0;
      score += platformScore;

      // Popularity boost (up to 5 points)
      const popularityScore = Math.min(5, Math.log10((game._count.favorites || 0) + 1) * 2);
      score += popularityScore;

      return {
        ...game,
        similarityScore: Math.round(score * 100) / 100,
        matchingTags: matchingTags.length,
        sameDeveloper: game.developerId === sourceGame.developerId,
      };
    });

    // Sort by score and take the top results
    scoredCandidates.sort((a, b) => b.similarityScore - a.similarityScore);
    const similarGames = scoredCandidates.slice(0, limit);

    // Format response
    const response = {
      sourceGame: {
        id: sourceGame.id,
        slug: sourceGame.slug,
        title: sourceGame.title,
        tags: tagSlugs,
      },
      similarGames: similarGames.map(game => ({
        id: game.id,
        slug: game.slug,
        title: game.title,
        tagline: game.tagline,
        coverUrl: game.coverUrl,
        priceCents: game.priceCents,
        avgRating: game.avgRating,
        platforms: game.platforms,
        developer: game.developer,
        tags: game.gameTags.map(gt => ({
          id: gt.tag.id,
          name: gt.tag.name,
          slug: gt.tag.slug,
        })),
        similarityScore: game.similarityScore,
        matchingTags: game.matchingTags,
        sameDeveloper: game.sameDeveloper,
        _count: game._count,
      })),
      algorithm: {
        description: 'Similarity score based on shared tags, developer, price range, ratings, and platforms',
        maxScore: 170,
        weights: {
          tags: '0-100 points (percentage of matching tags)',
          sameDeveloper: '30 points bonus',
          priceSimilarity: '0-15 points',
          rating: '0-10 points',
          platformMatch: '0-10 points',
          popularity: '0-5 points',
        },
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('GET /api/games/[id]/similar error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch similar games' },
      { status: 500 }
    );
  }
}



