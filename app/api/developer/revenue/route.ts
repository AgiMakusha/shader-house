import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { getDeveloperSubscriptionStats } from '@/lib/subscriptions/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get developer revenue stats
    const stats = await getDeveloperSubscriptionStats(session.user.id);

    // Format revenue data for the frontend
    const revenueData = {
      activeSupports: stats.activeSupports,
      monthlyRevenue: {
        directSales: stats.monthlyRevenue.directSales,
        creatorSupport: stats.monthlyRevenue.creatorSupport,
        proPlaytime: stats.monthlyRevenue.proPlaytime,
        tips: stats.monthlyRevenue.tips,
      },
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

