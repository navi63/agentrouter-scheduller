import { auth } from "@/lib/auth";

type UserRole = "SUPER_ADMIN" | "USER";

export async function getSession(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  return session;
}

export function hasRole(userRole: string, requiredRole: UserRole): boolean {
  if (requiredRole === "SUPER_ADMIN") {
    return userRole === "SUPER_ADMIN";
  }
  return true; // USER role can access USER-level routes
}

export function requireRole(requiredRole: UserRole) {
  return async (request: Request) => {
    const session = await getSession(request);
    
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasRole(session.user.role as string, requiredRole)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return null; // Continue
  };
}
