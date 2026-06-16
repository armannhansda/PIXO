import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  "/write",
  "/profile/settings",
];

// Define public-only routes (redirect authenticated users away from these)
const AUTH_ROUTES = [
  "/login",
  "/signup",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the session token from cookies
  const sessionToken = request.cookies.get("session-token")?.value;
  const isAuthenticated = !!sessionToken;

  // Check if trying to access protected route without auth
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // Check if trying to access auth route (login/signup) while already authenticated
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
