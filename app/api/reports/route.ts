// Public API route for submitting reports
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// POST - Submit a new report
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { type, reason, description, gameId, userId, ratingId, threadId, postId } = body;

    // Validate required fields
    if (!type || !reason) {
      return NextResponse.json(
        { error: "Type and reason are required" },
        { status: 400 }
      );
    }

    // Validate report type
    const validTypes = ["GAME", "USER", "REVIEW", "THREAD", "POST"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    // Validate reason
    const validReasons = [
      "SPAM", "INAPPROPRIATE", "HARASSMENT", "MALICIOUS",
      "COPYRIGHT", "MISINFORMATION", "IMPERSONATION", "OTHER"
    ];
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    }

    // If reason is OTHER, description is required
    if (reason === "OTHER" && !description?.trim()) {
      return NextResponse.json(
        { error: "Description is required when reason is 'Other'" },
        { status: 400 }
      );
    }

    // Validate that the appropriate ID is provided based on type
    if (type === "GAME" && !gameId) {
      return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
    }
    if (type === "USER" && !userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    if (type === "REVIEW" && !ratingId) {
      return NextResponse.json({ error: "Rating ID is required" }, { status: 400 });
    }
    if (type === "THREAD" && !threadId) {
      return NextResponse.json({ error: "Thread ID is required" }, { status: 400 });
    }
    if (type === "POST" && !postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    // Prevent self-reporting
    if (type === "USER" && userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot report yourself" },
        { status: 400 }
      );
    }

    // Check for existing pending report from same user for same content
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        status: { in: ["PENDING", "REVIEWING"] },
        ...(gameId && { gameId }),
        ...(userId && { reportedUserId: userId }),
        ...(ratingId && { ratingId }),
        ...(threadId && { threadId }),
        ...(postId && { postId }),
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this content" },
        { status: 400 }
      );
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        type,
        reason,
        description: description?.trim() || null,
        reporterId: session.user.id,
        gameId: type === "GAME" ? gameId : null,
        reportedUserId: type === "USER" ? userId : null,
        ratingId: type === "REVIEW" ? ratingId : null,
        threadId: type === "THREAD" ? threadId : null,
        postId: type === "POST" ? postId : null,
      },
    });

    // Notify admins about new report (create notification for all admins)
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "SYSTEM",
          title: "New Report Submitted",
          message: `A new ${type.toLowerCase()} report has been submitted for review.`,
          link: "/admin/reports",
        })),
      });
    }

    return NextResponse.json({
      success: true,
      report: { id: report.id },
      message: "Report submitted successfully. Our team will review it shortly.",
    });
  } catch (error) {
    console.error("Error submitting report:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}



