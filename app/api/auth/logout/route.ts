import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    // Delete the session cookie
    await destroySession();

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}

// Also support GET for easy testing
export async function GET(request: NextRequest) {
  return POST(request);
}
