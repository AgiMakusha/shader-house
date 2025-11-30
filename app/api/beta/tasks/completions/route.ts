import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
      return NextResponse.json(
        { error: "Game ID is required" },
        { status: 400 }
      );
    }

    // Check if user is the developer of this game
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { developerId: true },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.developerId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only view completions for your own games" },
        { status: 403 }
      );
    }

    // Fetch all task completions for this game
    const completions = await prisma.taskCompletion.findMany({
      where: {
        task: {
          gameId: gameId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            xpReward: true,
            rewardPoints: true,
            isOptional: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // PENDING first
        { submittedAt: 'desc' },
      ],
    });

    return NextResponse.json({
      completions,
    });
  } catch (error) {
    console.error("GET /api/beta/tasks/completions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

