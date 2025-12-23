import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSessionFromRequest } from '@/lib/auth/session';

// GET - Fetch developer's own devlogs (including drafts)
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'published', 'draft', 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const where: any = {
      developerId: userId,
    };

    if (status === 'published') {
      where.isPublished = true;
    } else if (status === 'draft') {
      where.isPublished = false;
    }

    const [devlogs, total] = await Promise.all([
      prisma.devlog.findMany({
        where,
        include: {
          game: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverUrl: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.devlog.count({ where }),
    ]);

    // Get stats
    const stats = await prisma.devlog.aggregate({
      where: { developerId: userId },
      _sum: { views: true, likeCount: true },
      _count: true,
    });

    const draftCount = await prisma.devlog.count({
      where: { developerId: userId, isPublished: false },
    });

    const publishedCount = await prisma.devlog.count({
      where: { developerId: userId, isPublished: true },
    });

    return NextResponse.json({
      devlogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalPosts: stats._count,
        totalViews: stats._sum.views || 0,
        totalLikes: stats._sum.likeCount || 0,
        draftCount,
        publishedCount,
      },
    });
  } catch (error) {
    console.error('Error fetching developer devlogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devlogs' },
      { status: 500 }
    );
  }
}
