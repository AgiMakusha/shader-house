// Admin API route for managing reports
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "PENDING";
    const type = searchParams.get("type") || "ALL";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status !== "ALL") {
      where.status = status;
    }

    if (type !== "ALL") {
      where.type = type;
    }

    // Fetch reports with related data
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          game: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverUrl: true,
            },
          },
          reportedUser: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          rating: {
            select: {
              id: true,
              stars: true,
              comment: true,
              game: {
                select: { title: true, slug: true },
              },
              user: {
                select: { name: true },
              },
            },
          },
          thread: {
            select: {
              id: true,
              title: true,
              game: {
                select: { title: true, slug: true },
              },
              author: {
                select: { name: true },
              },
            },
          },
          post: {
            select: {
              id: true,
              content: true,
              thread: {
                select: { title: true },
              },
              author: {
                select: { name: true },
              },
            },
          },
          resolvedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { status: "asc" }, // PENDING first
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    // Get stats
    const [pendingCount, reviewingCount, resolvedCount, dismissedCount] = await Promise.all([
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "REVIEWING" } }),
      prisma.report.count({ where: { status: "RESOLVED" } }),
      prisma.report.count({ where: { status: "DISMISSED" } }),
    ]);

    // Get type counts
    const [gameCount, userCount, reviewCount, threadCount, postCount, platformBugCount] = await Promise.all([
      prisma.report.count({ where: { type: "GAME", status: { in: ["PENDING", "REVIEWING"] } } }),
      prisma.report.count({ where: { type: "USER", status: { in: ["PENDING", "REVIEWING"] } } }),
      prisma.report.count({ where: { type: "REVIEW", status: { in: ["PENDING", "REVIEWING"] } } }),
      prisma.report.count({ where: { type: "THREAD", status: { in: ["PENDING", "REVIEWING"] } } }),
      prisma.report.count({ where: { type: "POST", status: { in: ["PENDING", "REVIEWING"] } } }),
      prisma.report.count({ where: { type: "PLATFORM_BUG", status: { in: ["PENDING", "REVIEWING"] } } }),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        pending: pendingCount,
        reviewing: reviewingCount,
        resolved: resolvedCount,
        dismissed: dismissedCount,
        total: pendingCount + reviewingCount + resolvedCount + dismissedCount,
      },
      typeCounts: {
        game: gameCount,
        user: userCount,
        review: reviewCount,
        thread: threadCount,
        post: postCount,
        platformBug: platformBugCount,
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

