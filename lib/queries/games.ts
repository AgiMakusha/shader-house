import { prisma } from '@/lib/db/prisma';
import { Platform, Prisma, ReleaseStatus } from '@prisma/client';
import { GameQuery, GameUpsert, RatingInput } from '@/lib/validations/game';

export async function getGames(query: GameQuery, userId?: string, statusFilter?: string | null) {
  const { q, tags, platform, priceFilter, sort, page, pageSize, developer } = query;

  const where: Prisma.GameWhereInput = {};

  // Handle release status filtering
  if (statusFilter === 'beta') {
    // Explicitly filter for BETA games only
    where.releaseStatus = ReleaseStatus.BETA;
  } else if (statusFilter === 'released') {
    // Explicitly filter for RELEASED games only
    where.releaseStatus = ReleaseStatus.RELEASED;
  } else if (developer !== 'me') {
    // By default, only show RELEASED games in public marketplace
    // Unless developer is viewing their own games (developer=me shows all)
    where.releaseStatus = ReleaseStatus.RELEASED;
  }
  // If developer='me' and no statusFilter, show all statuses

  // Developer filter
  if (developer) {
    console.log('🔍 Developer filter:', { developer, userId, statusFilter });
    // If developer='me', use the provided userId
    if (developer === 'me' && userId) {
      where.developerId = userId;
      console.log('✅ Filtering by userId:', userId);
    } else if (developer !== 'me') {
      // Otherwise use the provided developer ID
      where.developerId = developer;
      console.log('✅ Filtering by developerId:', developer);
    } else {
      console.log('⚠️ Developer=me but no userId provided!');
    }
  }

  // Search query
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { tagline: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  // Tags filter
  if (tags) {
    const tagSlugs = tags.split(',').filter(Boolean);
    if (tagSlugs.length > 0) {
      where.gameTags = {
        some: {
          tag: {
            slug: { in: tagSlugs },
          },
        },
      };
    }
  }

  // Platform filter
  if (platform) {
    where.platforms = {
      has: platform,
    };
  }

  // Price filter
  if (priceFilter === 'free') {
    where.priceCents = 0;
  } else if (priceFilter === 'paid') {
    where.priceCents = { gt: 0 };
  }

  // Sorting
  let orderBy: Prisma.GameOrderByWithRelationInput = { createdAt: 'desc' };
  
  switch (sort) {
    case 'popular':
      orderBy = { views: 'desc' };
      break;
    case 'rating':
      orderBy = { avgRating: 'desc' };
      break;
    case 'price-low':
      orderBy = { priceCents: 'asc' };
      break;
    case 'price-high':
      orderBy = { priceCents: 'desc' };
      break;
    default:
      orderBy = { createdAt: 'desc' };
  }

  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.game.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
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
            betaTesters: {
              where: {
                status: 'APPROVED',
              },
            },
            betaFeedback: true,
          },
        },
      },
    }),
    prisma.game.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getGameBySlug(slug: string, userId?: string) {
  const game = await prisma.game.findUnique({
    where: { slug },
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
      ratings: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              displayName: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
      _count: {
        select: {
          ratings: true,
          favorites: true,
        },
      },
    },
  });

  if (!game) return null;

  // Increment views
  await prisma.game.update({
    where: { id: game.id },
    data: { views: { increment: 1 } },
  });

  // Check if user has favorited, rated, or purchased
  let isFavorited = false;
  let userRating = null;
  let isPurchased = false;

  if (userId) {
    const [favorite, rating, purchase] = await Promise.all([
      prisma.favorite.findUnique({
        where: {
          gameId_userId: {
            gameId: game.id,
            userId,
          },
        },
      }),
      prisma.rating.findUnique({
        where: {
          gameId_userId: {
            gameId: game.id,
            userId,
          },
        },
      }),
      prisma.purchase.findUnique({
        where: {
          gameId_userId: {
            gameId: game.id,
            userId,
          },
        },
      }),
    ]);
    
    isFavorited = !!favorite;
    userRating = rating;
    isPurchased = !!purchase;
  }

  // Calculate rating distribution
  const ratingCounts = await prisma.rating.groupBy({
    by: ['stars'],
    where: { gameId: game.id },
    _count: true,
  });

  const distribution = [1, 2, 3, 4, 5].map((stars) => ({
    stars,
    count: ratingCounts.find((r) => r.stars === stars)?._count || 0,
  }));

  return {
    ...game,
    isFavorited,
    userRating,
    isPurchased,
    ratingDistribution: distribution,
  };
}

export async function getTags() {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' },
  });
}

/**
 * Get beta games (only games with releaseStatus = BETA)
 * Used for /games/beta page (Pro subscribers only)
 */
export async function getBetaGames() {
  const games = await prisma.game.findMany({
    where: {
      releaseStatus: ReleaseStatus.BETA,
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  return games;
}

export async function createGame(data: GameUpsert, developerId: string) {
  const { tags, ...gameData } = data;

  // Generate slug from title
  const slug = gameData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Check if slug exists
  const existing = await prisma.game.findUnique({ where: { slug } });
  if (existing) {
    throw new Error('A game with this title already exists');
  }

  // Create game
  const game = await prisma.game.create({
    data: {
      ...gameData,
      slug,
      developerId,
      gameFileUrl: gameData.gameFileUrl || null,
      externalUrl: gameData.externalUrl || null,
    },
  });

  // Connect tags
  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Find or create tag
      let tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
      if (!tag) {
        tag = await prisma.tag.create({
          data: {
            name: tagName,
            slug: tagSlug,
          },
        });
      }

      // Connect tag to game
      await prisma.gameTag.create({
        data: {
          gameId: game.id,
          tagId: tag.id,
        },
      });
    }
  }

  return game;
}

export async function updateGame(gameId: string, data: GameUpsert, userId: string) {
  const { tags, ...gameData } = data;

  // Verify ownership (RULE 1: Only game owner can update)
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { developer: true },
  });

  if (!game) {
    throw new Error('Game not found');
  }

  // STRICT: Only the developer who created the game can update it
  if (game.developerId !== userId) {
    throw new Error('Unauthorized: Only the game owner can update this game');
  }

  // RULE 2: Handle file replacement - delete old file if replacing
  const { replaceFile } = await import('@/lib/utils/file-manager');
  
  // If uploading a new game file, delete the old one
  if (gameData.gameFileUrl && game.gameFileUrl && gameData.gameFileUrl !== game.gameFileUrl) {
    await replaceFile(game.gameFileUrl, gameData.gameFileUrl);
  }

  // Update game
  const updated = await prisma.game.update({
    where: { id: gameId },
    data: {
      ...gameData,
      gameFileUrl: gameData.gameFileUrl || null,
      externalUrl: gameData.externalUrl || null,
    },
  });

  // Update tags
  if (tags) {
    // Remove existing tags
    await prisma.gameTag.deleteMany({
      where: { gameId },
    });

    // Add new tags
    for (const tagName of tags) {
      const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      let tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
      if (!tag) {
        tag = await prisma.tag.create({
          data: {
            name: tagName,
            slug: tagSlug,
          },
        });
      }

      await prisma.gameTag.create({
        data: {
          gameId,
          tagId: tag.id,
        },
      });
    }
  }

  return updated;
}

export async function rateGame(gameId: string, userId: string, data: RatingInput) {
  // Upsert rating
  const rating = await prisma.rating.upsert({
    where: {
      gameId_userId: {
        gameId,
        userId,
      },
    },
    update: {
      stars: data.stars,
      comment: data.comment || null,
    },
    create: {
      gameId,
      userId,
      stars: data.stars,
      comment: data.comment || null,
    },
  });

  // Recalculate average rating
  const ratings = await prisma.rating.findMany({
    where: { gameId },
  });

  const avgRating = ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;

  await prisma.game.update({
    where: { id: gameId },
    data: { avgRating },
  });

  return rating;
}

export async function toggleFavorite(gameId: string, userId: string) {
  const existing = await prisma.favorite.findUnique({
    where: {
      gameId_userId: {
        gameId,
        userId,
      },
    },
  });

  let favorited: boolean;

  if (existing) {
    // Remove favorite
    await prisma.favorite.delete({
      where: { id: existing.id },
    });
    await prisma.game.update({
      where: { id: gameId },
      data: { favCount: { decrement: 1 } },
    });
    favorited = false;
  } else {
    // Add favorite
    await prisma.favorite.create({
      data: {
        gameId,
        userId,
      },
    });
    await prisma.game.update({
      where: { id: gameId },
      data: { favCount: { increment: 1 } },
    });
    favorited = true;
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { favCount: true },
  });

  return {
    favorited,
    favCount: game?.favCount || 0,
  };
}

/**
 * Promote a beta game to full release
 * Only the game owner can promote
 */
export async function promoteToRelease(gameId: string, userId: string) {
  // Verify ownership
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { 
      id: true, 
      developerId: true, 
      releaseStatus: true,
      title: true,
    },
  });

  if (!game) {
    throw new Error('Game not found');
  }

  if (game.developerId !== userId) {
    throw new Error('Unauthorized: Only the game owner can promote to release');
  }

  if (game.releaseStatus === ReleaseStatus.RELEASED) {
    throw new Error('Game is already released');
  }

  // Promote to full release
  const updated = await prisma.game.update({
    where: { id: gameId },
    data: {
      releaseStatus: ReleaseStatus.RELEASED,
    },
  });

  return updated;
}

