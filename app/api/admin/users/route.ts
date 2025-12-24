// Admin API route for user management
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
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "ALL";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (role !== "ALL") {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { displayName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch users
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          displayName: true,
          image: true,
          role: true,
          emailVerified: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          xp: true,
          level: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              games: true,
              ratings: true,
              favorites: true,
            },
          },
          developerProfile: {
            select: {
              id: true,
              studioName: true,
              verificationStatus: true,
              isIndieEligible: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Get role counts
    const [totalUsers, developerCount, gamerCount, adminCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "DEVELOPER" } }),
      prisma.user.count({ where: { role: "GAMER" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: totalUsers,
        developers: developerCount,
        gamers: gamerCount,
        admins: adminCount,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}



