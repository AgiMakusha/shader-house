// API route for submitting general reports via URL
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { type, reason, contentUrl, description, screenshots } = body;

    // Platform bug reports have different requirements
    const isPlatformBug = type === "PLATFORM_BUG";

    // Validate required fields
    if (!type || !reason) {
      return NextResponse.json(
        { error: "Type and reason are required" },
        { status: 400 }
      );
    }

    // For non-platform-bug reports, contentUrl is required
    if (!isPlatformBug && !contentUrl) {
      return NextResponse.json(
        { error: "Content URL is required" },
        { status: 400 }
      );
    }

    // Validate report type
    const validTypes = ["GAME", "USER", "REVIEW", "THREAD", "POST", "PLATFORM_BUG"];
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

    // Try to extract IDs from the URL
    let gameId: string | null = null;
    let reportedUserId: string | null = null;
    let ratingId: string | null = null;
    let threadId: string | null = null;
    let postId: string | null = null;

    try {
      const url = new URL(contentUrl);
      const pathname = url.pathname;

      // Parse game URLs: /games/[slug]
      if (type === "GAME" && pathname.startsWith("/games/")) {
        const slug = pathname.split("/")[2];
        if (slug) {
          const game = await prisma.game.findUnique({
            where: { slug },
            select: { id: true },
          });
          if (game) {
            gameId = game.id;
          }
        }
      }

      // Parse thread URLs (discussion): /games/[slug]/community or similar
      if (type === "THREAD" && pathname.includes("/community")) {
        const threadIdParam = url.searchParams.get("thread");
        if (threadIdParam) {
          const thread = await prisma.discussionThread.findUnique({
            where: { id: threadIdParam },
            select: { id: true },
          });
          if (thread) {
            threadId = thread.id;
          }
        }
      }

      // For other types without specific ID parsing, we'll store the URL in description
    } catch (e) {
      // Invalid URL, continue with just the description
    }

    // Create the full description including the URL
    const fullDescription = isPlatformBug 
      ? description || "No details provided."
      : `Reported URL: ${contentUrl}\n\n${description || "No additional details provided."}`;

    // Validate screenshots (array of URLs, max 5)
    const validScreenshots = Array.isArray(screenshots) 
      ? screenshots.filter((s: string) => typeof s === "string" && s.startsWith("/uploads/")).slice(0, 5)
      : [];

    // Create the report
    const report = await prisma.report.create({
      data: {
        type,
        reason,
        description: fullDescription,
        reporterId: session.user.id,
        gameId,
        reportedUserId,
        ratingId,
        threadId,
        postId,
        screenshots: validScreenshots,
      },
    });

    // Notify admins about new report
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (admins.length > 0) {
      const notificationTitle = isPlatformBug ? "New Bug Report" : "New Report Submitted";
      const notificationMessage = isPlatformBug 
        ? "A user has reported a platform bug that needs investigation."
        : `A new ${type.toLowerCase()} report has been submitted for review.`;

      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "SYSTEM",
          title: notificationTitle,
          message: notificationMessage,
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
    console.error("Error submitting general report:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}

