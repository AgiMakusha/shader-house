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
  "/admin",
];

// Define which routes are auth-only (redirect if already authenticated)
const authRoutes = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  // Check if user is authenticated
  const isAuthenticated = !!session?.user;

  // Normalize role to uppercase for comparison (handles legacy lowercase roles)
  const userRole = session?.user?.role?.toUpperCase();
  const isDeveloper = userRole === "DEVELOPER";
  const isGamer = userRole === "GAMER";
  const isAdmin = userRole === "ADMIN";

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.includes(pathname)) {
    const redirectUrl = isAdmin
      ? "/admin"
      : isDeveloper
        ? "/profile/developer" 
        : "/profile/gamer"; // Existing gamers go to their profile
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Redirect unauthenticated users away from protected pages
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes - restrict to admin users only
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      // Non-admin users get redirected to home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Dashboard routes are developer-only
  if (isAuthenticated && pathname.startsWith("/dashboard")) {
    if (!isDeveloper) {
      return NextResponse.redirect(new URL("/profile/gamer", request.url));
    }
  }

  // Profile routes - redirect to correct profile based on role
  if (isAuthenticated) {
    if (pathname.startsWith("/profile/developer") && !isDeveloper && !isAdmin) {
      return NextResponse.redirect(new URL("/profile/gamer", request.url));
    }
    if (pathname.startsWith("/profile/gamer") && !isGamer && !isAdmin) {
      return NextResponse.redirect(new URL("/profile/developer", request.url));
    }
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

