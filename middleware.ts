import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { requiresEmailVerification, isEmailVerified } from "@/lib/security/email-verification-guard";

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

// Routes that are always accessible (public pages)
const publicPagesNoAuth = [
  '/terms',
  '/privacy',
  '/icons',
  '/register',
  '/verify-email', // Email verification page
  '/reset', // Password reset
  '/reset-password', // Password reset
];

// Routes that authenticated but unverified users can access
const allowedForUnverified = [
  '/verify-email',
  '/api/auth/send-verification',
  '/api/auth/verify-email',
  '/api/auth/session',
  '/api/auth/logout',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip session check for public pages that don't need auth
  const isPublicNoAuth = publicPagesNoAuth.some(route => pathname.startsWith(route));
  
  if (isPublicNoAuth) {
    return NextResponse.next();
  }
  
  const session = await getSessionFromRequest(request);

  // Check if user is authenticated
  const isAuthenticated = !!session?.user;
  
  // Check if email is verified (for authenticated users)
  const emailVerified = isAuthenticated ? isEmailVerified(session) : true;

  // Normalize role to uppercase for comparison (handles legacy lowercase roles)
  const userRole = session?.user?.role?.toUpperCase();
  const isDeveloper = userRole === "DEVELOPER";
  const isGamer = userRole === "GAMER";
  const isAdmin = userRole === "ADMIN";

  // Redirect authenticated users away from auth pages (only if verified)
  if (isAuthenticated && emailVerified && authRoutes.includes(pathname)) {
    const redirectUrl = isAdmin
      ? "/admin"
      : isDeveloper
        ? "/profile/developer" 
        : "/profile/gamer";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // CRITICAL: Block all platform access for unverified users
  // Allow only verification page, auth pages, home page, and public pages
  if (isAuthenticated && !emailVerified) {
    const isAllowedRoute = 
      pathname === '/' || // Home page (to show verification message)
      pathname.startsWith('/verify-email') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/api/auth/send-verification') ||
      pathname.startsWith('/api/auth/verify-email') ||
      pathname.startsWith('/api/auth/session') ||
      pathname.startsWith('/api/auth/logout') ||
      pathname.startsWith('/api/games') && !pathname.includes('/upload') && !pathname.includes('/publish') || // Allow viewing games
      publicPagesNoAuth.some(route => pathname.startsWith(route));
    
    if (!isAllowedRoute) {
      // Redirect to verification required page
      return NextResponse.redirect(new URL("/verify-email?required=true", request.url));
    }
  }

  // Redirect unauthenticated users away from protected pages
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes - restrict to admin users only (and verified)
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!emailVerified) {
      return NextResponse.redirect(new URL("/verify-email?required=true", request.url));
    }
    if (!isAdmin) {
      // Non-admin users get redirected to home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Dashboard routes are developer-only (and verified)
  if (isAuthenticated && emailVerified && pathname.startsWith("/dashboard")) {
    if (!isDeveloper) {
      return NextResponse.redirect(new URL("/profile/gamer", request.url));
    }
  }

  // Profile routes - redirect to correct profile based on role (and verified)
  if (isAuthenticated && emailVerified) {
    if (pathname.startsWith("/profile/developer") && !isDeveloper && !isAdmin) {
      return NextResponse.redirect(new URL("/profile/gamer", request.url));
    }
    if (pathname.startsWith("/profile/gamer") && !isGamer && !isAdmin) {
      return NextResponse.redirect(new URL("/profile/developer", request.url));
    }
  }

  // Add email verification status to response headers (for UI components to check)
  const response = NextResponse.next();
  if (isAuthenticated) {
    response.headers.set('x-email-verified', isEmailVerified(session) ? 'true' : 'false');
  }

  return response;
}

// PERFORMANCE FIX: Optimized matcher to skip more static routes
// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets (audio, images, video, uploads, fonts)
     * - manifest files and service workers
     * - robots.txt and sitemap
     */
    "/((?!api|_next/static|_next/image|favicon.ico|audio|images|video|anim|uploads|fonts|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.ico|.*\\.webp|.*\\.mp3|.*\\.mp4|.*\\.webm|manifest.json|sw.js|robots.txt|sitemap.xml).*)",
  ],
};

