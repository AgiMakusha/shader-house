// Session management using JWT tokens
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "your-secret-key-change-in-production-min-32-chars-long"
);

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
const SHORT_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours (when "remember me" is off)

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role: "DEVELOPER" | "GAMER" | "ADMIN";
  createdAt: number;
}

export interface SessionPayload {
  user: SessionUser;
  expiresAt: number;
}

export async function createSession(user: SessionUser, rememberMe: boolean = false): Promise<string> {
  const expiresAt = new Date(Date.now() + (rememberMe ? SESSION_DURATION : SHORT_SESSION_DURATION));
  
  const token = await new SignJWT({ user, expiresAt: expiresAt.getTime() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as SessionPayload;
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

export async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get("session")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function refreshSession(rememberMe: boolean = false) {
  const session = await getSession();
  
  if (!session?.user) return;
  
  await createSession(session.user, rememberMe);
}

