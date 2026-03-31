import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check for session cookie
  const sessionCookie = getSessionCookie(request);

  console.log("=== MIDDLEWARE DEBUG ===");
  console.log("Pathname:", pathname);
  console.log("Has session cookie:", !!sessionCookie);
  console.log("All cookies:", request.headers.get("cookie"));
  console.log("======================");

  // Redirect authenticated users away from login/register
  if (sessionCookie && (pathname === "/login" || pathname === "/register")) {
    console.log("Redirecting authenticated user to dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect dashboard routes - redirect unauthenticated users to login
  if (!sessionCookie && pathname.startsWith("/dashboard")) {
    console.log("Redirecting unauthenticated user to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  console.log("Allowing request to proceed");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
