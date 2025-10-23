import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/auth/validation";
import { createSession } from "@/lib/auth/session";
import bcrypt from "bcryptjs";

// TODO: Replace this with your actual database
// For now, using in-memory storage (data will be lost on server restart)
const users = new Map<string, {
  id: string;
  email: string;
  name: string;
  password: string;
  role: "developer" | "gamer";
  createdAt: number;
}>();

// Seed a test user (remove in production)
users.set("test@shaderhouse.com", {
  id: "1",
  email: "test@shaderhouse.com",
  name: "Test User",
  password: "$2a$10$N9qo8uLOickgx2ZMRZoMye6o8lR6mZ/fhfKnbhPqLpDZ8rZoS5nQW", // "Password123!"
  role: "developer",
  createdAt: Date.now(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = validation.data;

    // Find user (TODO: Replace with database query)
    const user = users.get(email.toLowerCase());

    if (!user) {
      // Generic error message to prevent email enumeration
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    }, rememberMe);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}

