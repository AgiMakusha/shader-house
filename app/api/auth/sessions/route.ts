import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// GET - List all active sessions for the user
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActiveAt: 'desc' },
      select: {
        id: true,
        device: true,
        browser: true,
        os: true,
        ip: true,
        location: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    // Get current session token to identify which is the current session
    const currentToken = request.cookies.get('session')?.value;

    return NextResponse.json({
      sessions: sessions.map(s => ({
        ...s,
        isCurrent: false, // We can't easily determine this without storing token hash
      })),
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// DELETE - Revoke a specific session or all sessions
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, revokeAll } = await request.json();

    if (revokeAll) {
      // Revoke all sessions except current
      await prisma.session.updateMany({
        where: {
          userId: session.user.id,
          isActive: true,
        },
        data: { isActive: false },
      });

      return NextResponse.json({ message: "All sessions revoked" });
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    // Revoke specific session
    const targetSession = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    });

    if (!targetSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Session revoked" });
  } catch (error) {
    console.error("Revoke session error:", error);
    return NextResponse.json(
      { error: "Failed to revoke session" },
      { status: 500 }
    );
  }
}



