import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";

// Define which routes require authentication
const protectedRoutes = [
  "/profile/developer",
  "/profile/gamer",
  "/membership",
  "/dashboard",
  "/settings",
];

// Define which routes are auth-only (redirect if already authenticated)
const authRoutes = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  // Check if user is authenticated
  const isAuthenticated = !!session?.user;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.includes(pathname)) {
    const redirectUrl = session.user.role === "developer" 
      ? "/profile/developer" 
      : "/membership"; // Gamers go to membership selection
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Redirect unauthenticated users away from protected pages
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|audio|images|video|anim).*)",
  ],
};

