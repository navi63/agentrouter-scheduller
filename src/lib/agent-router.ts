import type { PrismaClient } from "@prisma/client";

const AGENT_ROUTER_BASE = "https://agentrouter.org";

interface AgentRouterResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Execute a login action using the stored cookie
 * This uses a headless browser to perform the OAuth flow
 */
export async function executeLogin(
  agentRouterCookie: string,
  githubCookie: string,
  cookieId: number,
  prisma: PrismaClient,
  logId: number
): Promise<{
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}> {
  const { executeLoginWithBrowser } = await import("./browser");
  return executeLoginWithBrowser(agentRouterCookie, githubCookie, cookieId, prisma, logId);
}

/**
 * Execute a logout action - verify session and close
 * This uses a headless browser to perform the logout
 */
export async function executeLogout(
  agentRouterCookie: string,
  githubCookie: string,
  prisma: PrismaClient,
  logId: number
): Promise<{
  success: boolean;
  message: string;
}> {
  const { executeLogoutWithBrowser } = await import("./browser");
  return executeLogoutWithBrowser(agentRouterCookie, githubCookie, prisma, logId);
}

/**
 * Validate a cookie by checking the user/self endpoint
 */
export async function validateCookie(cookieValue: string): Promise<{
  isValid: boolean;
  username?: string;
  quota?: number;
}> {
  try {
    const res = await fetch(`${AGENT_ROUTER_BASE}/api/user/self`, {
      method: "GET",
      headers: {
        Cookie: cookieValue,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Cache-Control": "no-store",
        Referer: `${AGENT_ROUTER_BASE}/console`,
      },
    });

    const selfData = (await res.json()) as AgentRouterResponse;
    if (selfData.success && selfData.data) {
      const data = selfData.data as Record<string, unknown>;
      return {
        isValid: true,
        username: data.display_name as string,
        quota: data.quota as number,
      };
    }
    return { isValid: false };
  } catch {
    return { isValid: false };
  }
}
