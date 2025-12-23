import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/notifications
 * Get all notifications for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {
      userId: session.user.id,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const [rawNotifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where: { userId: session.user.id } }),
      prisma.notification.count({
        where: {
          userId: session.user.id,
          isRead: false,
        },
      }),
    ]);

    // Fix broken notification links for legacy notifications
    const notifications = rawNotifications.map((notification) => {
      let fixedLink = notification.link;
      
      if (fixedLink) {
        // Fix NEW_BETA_TESTER links - these should go to /profile/developer/beta
        // Old format: /profile/developer/beta/{gameSlug} (doesn't exist)
        if (notification.type === 'NEW_BETA_TESTER' && 
            fixedLink.startsWith('/profile/developer/beta/') && 
            !fixedLink.includes('/feedback') && 
            !fixedLink.includes('/tasks')) {
          fixedLink = '/profile/developer/beta';
        }
      }
      
      return {
        ...notification,
        link: fixedLink,
      };
    });

    return NextResponse.json({
      notifications,
      total,
      unreadCount,
      hasMore: offset + notifications.length < total,
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

