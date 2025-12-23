// Admin API route for listing indie verification requests
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status !== "ALL") {
      where.verificationStatus = status;
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { studioName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch developer profiles with user info
    const [profiles, total] = await Promise.all([
      prisma.developerProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
              image: true,
            },
          },
        },
        orderBy: [
          { verificationStatus: "asc" }, // PENDING first
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.developerProfile.count({ where }),
    ]);

    // Get stats for all statuses
    const [pendingCount, approvedCount, rejectedCount, appealingCount] = await Promise.all([
      prisma.developerProfile.count({ where: { verificationStatus: "PENDING" } }),
      prisma.developerProfile.count({ where: { verificationStatus: "APPROVED" } }),
      prisma.developerProfile.count({ where: { verificationStatus: "REJECTED" } }),
      prisma.developerProfile.count({ where: { verificationStatus: "APPEALING" } }),
    ]);

    return NextResponse.json({
      profiles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        appealing: appealingCount,
        total: pendingCount + approvedCount + rejectedCount + appealingCount,
      },
    });
  } catch (error) {
    console.error("Error fetching indie verifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch verifications" },
      { status: 500 }
    );
  }
}

