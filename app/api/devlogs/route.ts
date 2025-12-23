import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSessionFromRequest } from '@/lib/auth/session';
import { createNotification } from '@/lib/notifications/service';

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
}

// GET - Fetch devlogs feed with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, followed, beta
    const category = searchParams.get('category'); // specific category
    const gameId = searchParams.get('gameId'); // specific game
    const developerId = searchParams.get('developerId'); // specific developer
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Get current user for followed filter
    const session = await getSessionFromRequest(request);
    const userId = session?.user?.id;

    // Build where clause
    const where: any = {
      isPublished: true,
    };

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Filter by game
    if (gameId) {
      where.gameId = gameId;
    }

    // Filter by developer
    if (developerId) {
      where.developerId = developerId;
    }

    // Filter: followed devs
    if (filter === 'followed' && userId) {
      const subscriptions = await prisma.devlogSubscription.findMany({
        where: { userId },
        select: { developerId: true },
      });
      const followedDevIds = subscriptions.map((s) => s.developerId);
      where.developerId = { in: followedDevIds };
    }

    // Filter: beta games only
    if (filter === 'beta') {
      const betaGames = await prisma.game.findMany({
        where: { releaseStatus: 'BETA' },
        select: { id: true },
      });
      const betaGameIds = betaGames.map((g) => g.id);
      where.gameId = { in: betaGameIds };
    }

    // Count total
    const total = await prisma.devlog.count({ where });

    // Fetch devlogs
    const devlogs = await prisma.devlog.findMany({
      where,
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            displayName: true,
            image: true,
            role: true,
            developerProfile: {
              select: {
                studioName: true,
                verificationStatus: true,
              },
            },
          },
        },
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
            releaseStatus: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Add user's like status if logged in
    let devlogsWithLikeStatus = devlogs;
    if (userId) {
      const userLikes = await prisma.devlogLike.findMany({
        where: {
          userId,
          devlogId: { in: devlogs.map((d) => d.id) },
        },
        select: { devlogId: true },
      });
      const likedIds = new Set(userLikes.map((l) => l.devlogId));
      devlogsWithLikeStatus = devlogs.map((d) => ({
        ...d,
        isLiked: likedIds.has(d.id),
      }));
    }

    return NextResponse.json({
      devlogs: devlogsWithLikeStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching devlogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devlogs' },
      { status: 500 }
    );
  }
}

// POST - Create a new devlog
export async function POST(request: NextRequest) {
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
        { error: 'Only developers can create devlogs' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      coverImage,
      mediaUrls,
      category,
      tags,
      gameId,
      isPublished,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 1;
    
    while (await prisma.devlog.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create the devlog
    const devlog = await prisma.devlog.create({
      data: {
        developerId: userId,
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 200).replace(/<[^>]*>/g, ''),
        coverImage,
        mediaUrls: mediaUrls || [],
        category: category || 'BEHIND_THE_SCENES',
        tags: tags || [],
        gameId: gameId || null,
        isPublished: isPublished ?? false,
        publishedAt: isPublished ? new Date() : null,
      },
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    // If published, notify subscribers and game owners
    if (isPublished) {
      const developerName = devlog.developer.displayName || devlog.developer.name;
      const notifiedUserIds = new Set<string>();

      // Notify devlog subscribers (followers of the developer)
      const subscribers = await prisma.devlogSubscription.findMany({
        where: {
          developerId: userId,
          notifyNewPost: true,
        },
        select: { userId: true },
      });

      for (const subscriber of subscribers) {
        if (subscriber.userId !== userId) { // Don't notify the developer themselves
          notifiedUserIds.add(subscriber.userId);
          await createNotification({
            userId: subscriber.userId,
            type: 'NEW_DEVLOG',
            title: 'New Devlog Post',
            message: `${developerName} published a new devlog: "${devlog.title}"`,
            link: `/devlogs/${devlog.slug}`,
            metadata: {
              devlogId: devlog.id,
              developerId: userId,
              gameId: devlog.gameId,
            },
          });
        }
      }

      // If devlog is linked to a game, notify game owners
      if (devlog.gameId && devlog.game) {
        // Notify users who purchased the game
        const purchases = await prisma.purchase.findMany({
          where: {
            gameId: devlog.gameId,
            paymentStatus: 'completed',
          },
          select: { userId: true },
        });

        for (const purchase of purchases) {
          // Skip if already notified or is the developer
          if (notifiedUserIds.has(purchase.userId) || purchase.userId === userId) {
            continue;
          }
          notifiedUserIds.add(purchase.userId);
          await createNotification({
            userId: purchase.userId,
            type: 'NEW_DEVLOG',
            title: `New Devlog for ${devlog.game.title}`,
            message: `${developerName} posted a devlog update: "${devlog.title}"`,
            link: `/devlogs/${devlog.slug}`,
            metadata: {
              devlogId: devlog.id,
              developerId: userId,
              gameId: devlog.gameId,
            },
          });
        }

        // TODO: Add wishlist notifications when wishlist feature is implemented
        // For now, we only notify users who purchased the game

        // Notify beta testers of the game
        const betaTesters = await prisma.betaTester.findMany({
          where: { 
            gameId: devlog.gameId,
          },
          select: { userId: true },
        });

        for (const tester of betaTesters) {
          // Skip if already notified or is the developer
          if (notifiedUserIds.has(tester.userId) || tester.userId === userId) {
            continue;
          }
          notifiedUserIds.add(tester.userId);
          await createNotification({
            userId: tester.userId,
            type: 'NEW_DEVLOG',
            title: `New Devlog for ${devlog.game.title}`,
            message: `${developerName} posted a devlog update: "${devlog.title}"`,
            link: `/devlogs/${devlog.slug}`,
            metadata: {
              devlogId: devlog.id,
              developerId: userId,
              gameId: devlog.gameId,
            },
          });
        }
      }
    }

    return NextResponse.json({ devlog }, { status: 201 });
  } catch (error) {
    console.error('Error creating devlog:', error);
    return NextResponse.json(
      { error: 'Failed to create devlog' },
      { status: 500 }
    );
  }
}

