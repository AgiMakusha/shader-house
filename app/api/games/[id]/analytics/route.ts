import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

// GET /api/games/[id]/analytics - Get analytics for a game (developer only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the game
    const game = await prisma.game.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      include: {
        _count: {
          select: {
            ratings: true,
            favorites: true,
            purchases: true,
            betaTesters: true,
            betaFeedback: true,
          },
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Verify ownership
    if (game.developerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the game developer can view analytics' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // Default to 30 days
    const periodDays = parseInt(period, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get aggregate playtime data
    const playtimeData = await prisma.playtimeEntry.aggregate({
      where: {
        gameId: game.id,
        sessionDate: { gte: startDate },
      },
      _sum: {
        duration: true,
      },
      _count: {
        _all: true,
      },
    });

    // Get total playtime (all time)
    const totalPlaytime = await prisma.playtimeEntry.aggregate({
      where: { gameId: game.id },
      _sum: { duration: true },
    });

    // Get unique players count
    const uniquePlayers = await prisma.playtimeEntry.groupBy({
      by: ['userId'],
      where: {
        gameId: game.id,
        sessionDate: { gte: startDate },
      },
    });

    // Get playtime distribution by day
    const playtimeByDay = await prisma.$queryRaw<{ date: string; total_seconds: number; sessions: number }[]>`
      SELECT 
        DATE("sessionDate") as date,
        SUM(duration) as total_seconds,
        COUNT(*) as sessions
      FROM playtime_entries
      WHERE "gameId" = ${game.id}
        AND "sessionDate" >= ${startDate}
      GROUP BY DATE("sessionDate")
      ORDER BY date DESC
    `;

    // Get rating distribution
    const ratingDistribution = await prisma.rating.groupBy({
      by: ['stars'],
      where: { gameId: game.id },
      _count: true,
    });

    // Get recent ratings
    const recentRatings = await prisma.rating.findMany({
      where: {
        gameId: game.id,
        createdAt: { gte: startDate },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get favorites trend (new favorites per day)
    const favoritesTrend = await prisma.$queryRaw<{ date: string; count: number }[]>`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM favorites
      WHERE "gameId" = ${game.id}
        AND "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    `;

    // Get purchases trend
    const purchasesTrend = await prisma.$queryRaw<{ date: string; count: number; revenue: number }[]>`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as count,
        SUM("pricePaid") as revenue
      FROM purchases
      WHERE "gameId" = ${game.id}
        AND "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    `;

    // Calculate revenue totals
    const totalRevenue = await prisma.purchase.aggregate({
      where: { gameId: game.id },
      _sum: { pricePaid: true },
    });

    const periodRevenue = await prisma.purchase.aggregate({
      where: {
        gameId: game.id,
        createdAt: { gte: startDate },
      },
      _sum: { pricePaid: true },
    });

    // Get version download stats (if applicable)
    const versionStats = await prisma.gameVersion.findMany({
      where: { gameId: game.id },
      orderBy: { releasedAt: 'desc' },
      take: 5,
      select: {
        version: true,
        title: true,
        releasedAt: true,
      },
    });

    // Format the response
    const analytics = {
      overview: {
        views: game.views,
        downloads: game.downloads,
        favorites: game._count.favorites,
        purchases: game._count.purchases,
        ratings: game._count.ratings,
        avgRating: game.avgRating,
        betaTesters: game._count.betaTesters,
        feedbackCount: game._count.betaFeedback,
      },
      playtime: {
        totalSeconds: totalPlaytime._sum.duration || 0,
        periodSeconds: playtimeData._sum.duration || 0,
        periodSessions: playtimeData._count._all || 0,
        uniquePlayersInPeriod: uniquePlayers.length,
        averageSessionMinutes: playtimeData._count._all 
          ? Math.round((playtimeData._sum.duration || 0) / playtimeData._count._all / 60) 
          : 0,
        byDay: playtimeByDay.map(d => ({
          date: d.date,
          totalMinutes: Math.round(Number(d.total_seconds) / 60),
          sessions: Number(d.sessions),
        })),
      },
      ratings: {
        distribution: [1, 2, 3, 4, 5].map(stars => ({
          stars,
          count: ratingDistribution.find(r => r.stars === stars)?._count || 0,
        })),
        recent: recentRatings.map(r => ({
          id: r.id,
          stars: r.stars,
          comment: r.comment,
          user: r.user.displayName || r.user.name,
          createdAt: r.createdAt,
        })),
      },
      favorites: {
        total: game._count.favorites,
        trend: favoritesTrend.map(f => ({
          date: f.date,
          count: Number(f.count),
        })),
      },
      revenue: {
        totalCents: totalRevenue._sum.pricePaid || 0,
        periodCents: periodRevenue._sum.pricePaid || 0,
        periodPurchases: purchasesTrend.reduce((sum, p) => sum + Number(p.count), 0),
        trend: purchasesTrend.map(p => ({
          date: p.date,
          count: Number(p.count),
          revenueCents: Number(p.revenue),
        })),
      },
      versions: versionStats,
      period: {
        days: periodDays,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    };

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('GET /api/games/[id]/analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

