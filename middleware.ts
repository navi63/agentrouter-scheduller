import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type RoleProtectedRoute = {
  path: string;
  roles?: ("SUPER_ADMIN" | "USER")[];
};

const protectedRoutes: RoleProtectedRoute[] = [
  { path: "/dashboard", roles: ["SUPER_ADMIN", "USER"] },
  { path: "/dashboard/users", roles: ["SUPER_ADMIN"] },
  { path: "/dashboard/cookies", roles: ["SUPER_ADMIN", "USER"] },
  { path: "/dashboard/scheduler", roles: ["SUPER_ADMIN", "USER"] },
  { path: "/dashboard/logs", roles: ["SUPER_ADMIN", "USER"] },
  { path: "/dashboard/redemption-logs", roles: ["SUPER_ADMIN", "USER"] },
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  console.log("=== MIDDLEWARE DEBUG ===");
  console.log("Pathname:", pathname);

  // Fetch session without loading Prisma in edge runtime
  let session = null;
  try {
    const res = await fetch(new URL("/api/auth/session", request.url), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    if (res.ok) {
      session = await res.json();
    }
  } catch (error) {
    console.error("Middleware session fetch error:", error);
  }

  console.log("Has session:", !!session);
  console.log("User role:", session?.user?.role);
  console.log("======================");

  // Redirect authenticated users away from login/register
  if (session && (pathname === "/login" || pathname === "/register")) {
    console.log("Redirecting authenticated user to dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Check if path is protected and requires specific roles
  const protectedRoute = protectedRoutes.find(r => pathname.startsWith(r.path));

  if (protectedRoute) {
    if (!session) {
      console.log("No session, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (protectedRoute.roles && !protectedRoute.roles.includes(session.user.role as any)) {
      console.log("User role not authorized:", session.user.role, "Required:", protectedRoute.roles);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  console.log("Allowing request to proceed");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
