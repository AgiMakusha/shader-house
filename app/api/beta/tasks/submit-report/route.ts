import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const reportSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  gameId: z.string().min(1, "Game ID is required"),
  report: z.string().min(20, "Report must be at least 20 characters"),
  screenshot: z.string().optional(),
  deviceInfo: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log('📝 Task report submission:', JSON.stringify(body, null, 2));
    
    const validated = reportSchema.parse(body);

    // Check if user is a beta tester for this game
    const tester = await prisma.betaTester.findUnique({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId: validated.gameId,
        },
      },
    });

    if (!tester) {
      return NextResponse.json(
        { error: "You must be a beta tester for this game" },
        { status: 403 }
      );
    }

    // Check if task exists and belongs to this game
    const task = await prisma.betaTask.findUnique({
      where: { id: validated.taskId },
    });

    if (!task || task.gameId !== validated.gameId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if task completion already exists
    const existingCompletion = await prisma.betaTaskCompletion.findUnique({
      where: {
        userId_taskId: {
          userId: session.user.id,
          taskId: validated.taskId,
        },
      },
    });

    if (existingCompletion) {
      if (existingCompletion.status === 'VERIFIED') {
        return NextResponse.json(
          { error: "You have already completed this task" },
          { status: 400 }
        );
      }
      
      if (existingCompletion.status === 'PENDING') {
        return NextResponse.json(
          { error: "Your report is already pending verification" },
          { status: 400 }
        );
      }

      // If rejected, allow resubmission by updating the existing record
      const updated = await prisma.betaTaskCompletion.update({
        where: { id: existingCompletion.id },
        data: {
          report: validated.report,
          screenshot: validated.screenshot,
          deviceInfo: validated.deviceInfo,
          status: 'PENDING',
          submittedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Task report resubmitted successfully",
        completion: updated,
      });
    }

    // Create new task completion
    const completion = await prisma.betaTaskCompletion.create({
      data: {
        userId: session.user.id,
        testerId: tester.id,
        taskId: validated.taskId,
        report: validated.report,
        screenshot: validated.screenshot,
        deviceInfo: validated.deviceInfo,
        status: 'PENDING',
        submittedAt: new Date(),
      },
    });

    console.log('✅ Task report submitted:', completion.id);

    return NextResponse.json({
      message: "Task report submitted successfully",
      completion,
    });
  } catch (error) {
    console.error("POST /api/beta/tasks/submit-report error:", error);

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

