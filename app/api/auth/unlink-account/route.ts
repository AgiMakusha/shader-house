import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// POST - Unlink an OAuth provider account
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accountId, provider } = await request.json();

    if (!accountId && !provider) {
      return NextResponse.json(
        { error: "Account ID or provider required" },
        { status: 400 }
      );
    }

    // Get user with accounts and check if they have a password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the account to unlink
    const accountToUnlink = user.accounts.find(
      a => accountId ? a.id === accountId : a.provider === provider
    );

    if (!accountToUnlink) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    // Check if user has at least one login method remaining
    const hasPassword = !!user.password;
    const remainingAccounts = user.accounts.length - 1;

    if (!hasPassword && remainingAccounts === 0) {
      return NextResponse.json(
        { error: "Cannot unlink the only login method. Please set a password first." },
        { status: 400 }
      );
    }

    // Unlink the account
    await prisma.account.delete({
      where: { id: accountToUnlink.id },
    });

    return NextResponse.json({
      message: `${accountToUnlink.provider} account unlinked successfully`,
    });
  } catch (error) {
    console.error("Unlink account error:", error);
    return NextResponse.json(
      { error: "Failed to unlink account" },
      { status: 500 }
    );
  }
}

