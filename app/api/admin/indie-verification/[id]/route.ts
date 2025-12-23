// Admin API route for updating indie verification status
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// GET - Fetch single developer profile details
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

    const profile = await prisma.developerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            image: true,
            role: true,
            emailVerified: true,
            _count: {
              select: {
                games: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PATCH - Update verification status
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
    const { status, rejectionReason } = body;

    // Validate status
    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "APPEALING"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // If rejecting, require a reason
    if (status === "REJECTED" && !rejectionReason?.trim()) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    // Update the profile
    const updatedProfile = await prisma.developerProfile.update({
      where: { id },
      data: {
        verificationStatus: status,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        rejectionReason: status === "REJECTED" ? rejectionReason.trim() : null,
        isIndieEligible: status === "APPROVED",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Create notification for the developer
    const notificationTitle = status === "APPROVED" 
      ? "Indie Status Approved!" 
      : status === "REJECTED"
        ? "Indie Status Review Update"
        : "Verification Status Updated";
    
    const notificationMessage = status === "APPROVED"
      ? "Congratulations! Your indie developer status has been approved. You now have access to indie-exclusive perks!"
      : status === "REJECTED"
        ? `Your indie status verification was not approved. Reason: ${rejectionReason}. You can appeal this decision by providing additional evidence.`
        : "Your verification status has been updated.";

    await prisma.notification.create({
      data: {
        userId: updatedProfile.user.id,
        type: "SYSTEM",
        title: notificationTitle,
        message: notificationMessage,
        link: "/profile/developer/settings",
      },
    });

    return NextResponse.json({ 
      success: true, 
      profile: updatedProfile,
      message: `Status updated to ${status}` 
    });
  } catch (error) {
    console.error("Error updating verification:", error);
    return NextResponse.json(
      { error: "Failed to update verification" },
      { status: 500 }
    );
  }
}

