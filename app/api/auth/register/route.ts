import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/auth/validation";
import { createSession } from "@/lib/auth/session";
import bcrypt from "bcryptjs";

// TODO: Replace this with your actual database
// For now, using in-memory storage (data will be lost on server restart)
// Import the same users Map from login route
const users = new Map<string, {
  id: string;
  email: string;
  name: string;
  password: string;
  role: "developer" | "gamer";
  createdAt: number;
}>();

// Seed a test user (should match login route)
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
    const validation = registerSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;

    // Check if user already exists (TODO: Replace with database query)
    if (users.has(email.toLowerCase())) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (TODO: Replace with database insert)
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      role,
      createdAt: Date.now(),
    };

    users.set(email.toLowerCase(), newUser);

    // Create session (auto-login after registration)
    await createSession({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt,
    }, true); // Remember me = true by default for new registrations

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}

