// Admin API route for individual game management
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// PATCH - Update game (feature/unfeature, change status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isFeatured, releaseStatus } = body;

    const updateData: any = {};
    
    if (typeof isFeatured === "boolean") {
      updateData.isFeatured = isFeatured;
      updateData.featuredAt = isFeatured ? new Date() : null;
    }
    
    if (releaseStatus) {
      const validStatuses = ["DRAFT", "BETA", "RELEASED"];
      if (!validStatuses.includes(releaseStatus)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updateData.releaseStatus = releaseStatus;
    }

    const updatedGame = await prisma.game.update({
      where: { id },
      data: updateData,
      include: {
        developer: {
          select: { id: true, name: true },
        },
      },
    });

    // Notify developer about changes
    if (isFeatured !== undefined) {
      await prisma.notification.create({
        data: {
          userId: updatedGame.developer.id,
          type: "SYSTEM",
          title: isFeatured ? "Game Featured!" : "Game Unfeatured",
          message: isFeatured 
            ? `Congratulations! "${updatedGame.title}" has been featured on Shader House!`
            : `"${updatedGame.title}" is no longer featured.`,
          link: `/games/${updatedGame.slug}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      game: updatedGame,
    });
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { error: "Failed to update game" },
      { status: 500 }
    );
  }
}

// DELETE - Remove game
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { id } = await params;

    const game = await prisma.game.findUnique({
      where: { id },
      select: { id: true, title: true, developerId: true },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Delete the game
    await prisma.game.delete({
      where: { id },
    });

    // Notify developer
    await prisma.notification.create({
      data: {
        userId: game.developerId,
        type: "SYSTEM",
        title: "Game Removed",
        message: `"${game.title}" has been removed from the platform by an administrator.`,
        link: "/profile/developer/projects",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Game deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json(
      { error: "Failed to delete game" },
      { status: 500 }
    );
  }
}

