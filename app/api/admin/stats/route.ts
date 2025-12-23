// Admin API route for platform statistics
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Fetch platform statistics
    const [
      totalUsers,
      totalDevelopers,
      totalGamers,
      totalGames,
      pendingVerifications,
      activeSubscriptions,
      betaGames,
      releasedGames,
      pendingReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "DEVELOPER" } }),
      prisma.user.count({ where: { role: "GAMER" } }),
      prisma.game.count(),
      prisma.developerProfile.count({ where: { verificationStatus: "PENDING" } }),
      prisma.user.count({ where: { subscriptionStatus: "ACTIVE" } }),
      prisma.game.count({ where: { releaseStatus: "BETA" } }),
      prisma.game.count({ where: { releaseStatus: "RELEASED" } }),
      prisma.report.count({ where: { status: { in: ["PENDING", "REVIEWING"] } } }),
    ]);

    // Get recent activity
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const recentGames = await prisma.game.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        releaseStatus: true,
        createdAt: true,
        developer: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      stats: {
        users: {
          total: totalUsers,
          developers: totalDevelopers,
          gamers: totalGamers,
        },
        games: {
          total: totalGames,
          beta: betaGames,
          released: releasedGames,
        },
        moderation: {
          pendingVerifications,
          pendingReports,
        },
        subscriptions: {
          active: activeSubscriptions,
        },
      },
      recentActivity: {
        users: recentUsers,
        games: recentGames,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

