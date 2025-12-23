// Admin API route for managing individual reports
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// GET - Fetch single report details
export async function GET(
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

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
        game: true,
        reportedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            createdAt: true,
            _count: {
              select: {
                games: true,
                ratings: true,
              },
            },
          },
        },
        rating: {
          include: {
            game: {
              select: { title: true, slug: true },
            },
            user: {
              select: { id: true, name: true },
            },
          },
        },
        thread: {
          include: {
            game: {
              select: { title: true, slug: true },
            },
            author: {
              select: { id: true, name: true },
            },
          },
        },
        post: {
          include: {
            thread: {
              select: { id: true, title: true },
            },
            author: {
              select: { id: true, name: true },
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
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

// PATCH - Update report status/resolution
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
    const { status, resolution, actionTaken } = body;

    // Validate status
    const validStatuses = ["PENDING", "REVIEWING", "RESOLVED", "DISMISSED"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Validate action
    const validActions = [
      "WARNING_ISSUED", "CONTENT_REMOVED", "CONTENT_HIDDEN",
      "USER_SUSPENDED", "USER_BANNED", "NO_ACTION"
    ];
    if (actionTaken && !validActions.includes(actionTaken)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get the existing report
    const existingReport = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: { select: { id: true } },
        reportedUser: { select: { id: true } },
      },
    });

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      
      // If resolving/dismissing, set resolution fields
      if (status === "RESOLVED" || status === "DISMISSED") {
        updateData.resolvedById = session.user.id;
        updateData.resolvedAt = new Date();
      }
    }
    
    if (resolution !== undefined) {
      updateData.resolution = resolution;
    }
    
    if (actionTaken) {
      updateData.actionTaken = actionTaken;
    }

    // Update the report
    const updatedReport = await prisma.report.update({
      where: { id },
      data: updateData,
      include: {
        reporter: {
          select: { id: true, name: true },
        },
      },
    });

    // Notify the reporter about resolution
    if (status === "RESOLVED" || status === "DISMISSED") {
      const notificationTitle = status === "RESOLVED" 
        ? "Report Resolved" 
        : "Report Reviewed";
      
      const notificationMessage = status === "RESOLVED"
        ? `Your report has been reviewed and action has been taken. Thank you for helping keep Shader House safe.`
        : `Your report has been reviewed. After investigation, we determined no action was necessary at this time.`;

      await prisma.notification.create({
        data: {
          userId: updatedReport.reporter.id,
          type: "REPORT_RESOLVED",
          title: notificationTitle,
          message: notificationMessage,
          link: "/profile/gamer/notifications",
        },
      });

      // If action was taken against a user, notify them
      if (existingReport.reportedUser && actionTaken && actionTaken !== "NO_ACTION") {
        const actionMessages: Record<string, string> = {
          WARNING_ISSUED: "You have received a warning for violating our community guidelines.",
          CONTENT_REMOVED: "Some of your content has been removed for violating our community guidelines.",
          CONTENT_HIDDEN: "Some of your content has been hidden pending review.",
          USER_SUSPENDED: "Your account has been temporarily suspended for violating our community guidelines.",
          USER_BANNED: "Your account has been permanently banned for violating our community guidelines.",
        };

        await prisma.notification.create({
          data: {
            userId: existingReport.reportedUser.id,
            type: "REPORT_ACTION_TAKEN",
            title: "Account Notice",
            message: actionMessages[actionTaken] || "Action has been taken on your account.",
            link: "/terms",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      report: updatedReport,
      message: `Report ${status?.toLowerCase() || "updated"} successfully`,
    });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}

