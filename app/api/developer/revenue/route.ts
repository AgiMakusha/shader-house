import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { getDeveloperSubscriptionStats } from '@/lib/subscriptions/utils';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const developerId = session.user.id;

    // Get developer revenue stats (monthly)
    const stats = await getDeveloperSubscriptionStats(developerId);

    // Get all-time totals from actual purchases and tips
    // Fetch all purchases for developer's games
    const purchasesTotal = await prisma.purchase.aggregate({
      where: {
        game: {
          developerId: developerId,
        },
        paymentStatus: 'completed',
      },
      _sum: {
        developerAmount: true,
      },
    });

    // Fetch all tips received
    const tipsTotal = await prisma.tip.aggregate({
      where: {
        toUserId: developerId,
        paymentStatus: 'completed',
      },
      _sum: {
        developerAmount: true,
      },
    });

    const allTimeDirectSales = purchasesTotal._sum.developerAmount || 0;
    const allTimeTips = tipsTotal._sum.developerAmount || 0;

    // Format revenue data for the frontend
    const revenueData = {
      activeSupports: stats.activeSupports,
      monthlyRevenue: {
        directSales: stats.monthlyRevenue.directSales,
        creatorSupport: stats.monthlyRevenue.creatorSupport,
        proPlaytime: stats.monthlyRevenue.proPlaytime,
        tips: stats.monthlyRevenue.tips,
      },
      // All-time totals (actual amounts from purchases and tips)
      allTimeRevenue: {
        directSales: allTimeDirectSales,
        tips: allTimeTips,
        total: allTimeDirectSales + allTimeTips,
      },
      // Monthly total (for backwards compatibility)
      totalRevenue:
        stats.monthlyRevenue.directSales +
        stats.monthlyRevenue.creatorSupport +
        stats.monthlyRevenue.proPlaytime +
        stats.monthlyRevenue.tips,
      revenueHistory: [], // TODO: Implement historical data
    };

    return NextResponse.json(revenueData);
  } catch (error) {
    console.error('Error fetching developer revenue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

