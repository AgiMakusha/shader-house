import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get session from request
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user from database with developer profile if applicable
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        developerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return user data (excluding password)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        developerProfile: user.developerProfile,
      },
    });

  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user profile" },
      { status: 500 }
    );
  }
}

