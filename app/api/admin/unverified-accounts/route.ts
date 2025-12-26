import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/admin/unverified-accounts
 * Get statistics about unverified accounts
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get unverified accounts
    const [unverifiedAccounts, totalUnverified, accountsWithActivity] = await Promise.all([
      prisma.user.findMany({
        where: {
          emailVerified: null,
          createdAt: {
            lt: cutoffDate,
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          role: true,
          _count: {
            select: {
              games: true,
              purchases: true,
              ratings: true,
              favorites: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: 100, // Limit to first 100
      }),
      prisma.user.count({
        where: {
          emailVerified: null,
          createdAt: {
            lt: cutoffDate,
          },
        },
      }),
      prisma.user.count({
        where: {
          emailVerified: null,
          createdAt: {
            lt: cutoffDate,
          },
          OR: [
            { games: { some: {} } },
            { purchases: { some: {} } },
          ],
        },
      }),
    ]);

    // Calculate accounts safe to delete (no activity)
    const safeToDelete = totalUnverified - accountsWithActivity;

    return NextResponse.json({
      summary: {
        totalUnverified: totalUnverified,
        accountsWithActivity: accountsWithActivity,
        safeToDelete: safeToDelete,
        cutoffDate: cutoffDate.toISOString(),
        days: days,
      },
      accounts: unverifiedAccounts,
    });
  } catch (error) {
    console.error('Error fetching unverified accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unverified accounts' },
      { status: 500 }
    );
  }
}

