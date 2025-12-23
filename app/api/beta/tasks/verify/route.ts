import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const verifySchema = z.object({
  completionId: z.string().min(1, "Completion ID is required"),
  approved: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a developer
    const developer = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (developer?.role !== 'DEVELOPER') {
      return NextResponse.json(
        { error: "Only developers can verify task completions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('✅ Task verification request:', JSON.stringify(body, null, 2));
    
    const validated = verifySchema.parse(body);

    // Get the completion with task and game info
    const completion = await prisma.betaTaskCompletion.findUnique({
      where: { id: validated.completionId },
      include: {
        task: {
          include: {
            game: {
              select: {
                developerId: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            xp: true,
            points: true,
          },
        },
      },
    });

    if (!completion) {
      return NextResponse.json(
        { error: "Task completion not found" },
        { status: 404 }
      );
    }

    // Verify the developer owns the game
    if (completion.task.game.developerId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only verify completions for your own games" },
        { status: 403 }
      );
    }

    // Check if already verified
    if (completion.status === 'VERIFIED') {
      return NextResponse.json(
        { error: "This task completion has already been verified" },
        { status: 400 }
      );
    }

    if (validated.approved) {
      // Approve and award rewards
      const [updatedCompletion, updatedUser] = await prisma.$transaction([
        // Update completion status
        prisma.betaTaskCompletion.update({
          where: { id: validated.completionId },
          data: {
            status: 'VERIFIED',
            verifiedAt: new Date(),
          },
        }),
        // Award XP and points to the gamer
        prisma.user.update({
          where: { id: completion.user.id },
          data: {
            xp: {
              increment: completion.task.xpReward,
            },
            points: {
              increment: completion.task.rewardPoints,
            },
          },
        }),
      ]);

      console.log(`✅ Task verified! Awarded ${completion.task.xpReward} XP and ${completion.task.rewardPoints} points to ${completion.user.name}`);

      return NextResponse.json({
        message: "Task completion verified and rewards awarded",
        completion: updatedCompletion,
        rewards: {
          xp: completion.task.xpReward,
          points: completion.task.rewardPoints,
        },
      });
    } else {
      // Reject the completion
      const updatedCompletion = await prisma.betaTaskCompletion.update({
        where: { id: validated.completionId },
        data: {
          status: 'REJECTED',
          verifiedAt: new Date(),
        },
      });

      console.log(`❌ Task rejected for ${completion.user.name}`);

      return NextResponse.json({
        message: "Task completion rejected",
        completion: updatedCompletion,
      });
    }
  } catch (error) {
    console.error("POST /api/beta/tasks/verify error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

