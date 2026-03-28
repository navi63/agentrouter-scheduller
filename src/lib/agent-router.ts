/**
 * AgentRouter API Integration Service
 * Handles login/logout automation via session cookies
 */

const AGENT_ROUTER_BASE = "https://agentrouter.org";

interface AgentRouterResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Helper to log a step to the database
 */
async function logStep(
  prisma: any,
  logId: number,
  step: string,
  level: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  await prisma.logEntry.create({
    data: {
      logId,
      step,
      level,
      message,
      metadata: metadata ? JSON.stringify(metadata, null, 2) : undefined,
    },
  });
}

/**
 * Log a curl-style request
 */
async function logRequest(
  prisma: any,
  logId: number,
  step: string,
  method: string,
  url: string,
  headers: Record<string, string>,
  responseStatus: number,
  responseBody?: unknown
) {
  const curlCommand = `curl -X ${method} "${url}" \\\n  ${Object.entries(headers)
    .map(([key, value]) => `-H "${key}: ${value}"`)
    .join(" \\\n  ")}`;

  const level = responseStatus >= 400 ? "ERROR" : "INFO";

  await logStep(
    prisma,
    logId,
    step,
    level,
    `${method} ${url} - Status: ${responseStatus}`,
    {
      curl: curlCommand,
      headers,
      responseStatus,
      responseBody,
    }
  );
}

/**
 * Step 1: Get OAuth state token from agentrouter
 */
async function getOAuthState(
  cookieValue: string,
  prisma: any,
  logId: number
): Promise<{ state: string; sessionCookie: string }> {
  const headers = {
    Cookie: cookieValue,
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Cache-Control": "no-store",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: `${AGENT_ROUTER_BASE}/login`,
  };

  const res = await fetch(`${AGENT_ROUTER_BASE}/api/oauth/state`, {
    method: "GET",
    headers,
  });

  // Log the request
  await logRequest(
    prisma,
    logId,
    "GET /api/oauth/state",
    "GET",
    `${AGENT_ROUTER_BASE}/api/oauth/state`,
    headers,
    res.status
  );

  // Extract Set-Cookie from response
  const setCookie = res.headers.get("set-cookie") || "";
  const sessionMatch = setCookie.match(/session=([^;]+)/);
  const newSessionCookie = sessionMatch ? `session=${sessionMatch[1]}` : "";

  const json = (await res.json()) as AgentRouterResponse;
  if (!json.success) {
    throw new Error(`Failed to get OAuth state: ${json.message}`);
  }

  return {
    state: json.data as unknown as string,
    sessionCookie: newSessionCookie || cookieValue,
  };
}

/**
 * Step 2: Complete OAuth callback with agentrouter
 * This calls the /api/oauth/github endpoint with a code and state
 */
async function completeOAuth(
  cookieValue: string,
  code: string,
  state: string,
  prisma: any,
  logId: number
): Promise<{ userData: Record<string, unknown>; sessionCookie: string }> {
  const headers = {
    Cookie: cookieValue,
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Cache-Control": "no-store",
    Referer: `${AGENT_ROUTER_BASE}/oauth/github?code=${code}&state=${state}`,
  };

  const url = `${AGENT_ROUTER_BASE}/api/oauth/github?code=${code}&state=${state}`;
  const res = await fetch(url, {
    method: "GET",
    headers,
  });

  // Log the request
  await logRequest(
    prisma,
    logId,
    "GET /api/oauth/github",
    "GET",
    url,
    headers,
    res.status
  );

  const setCookie = res.headers.get("set-cookie") || "";
  const sessionMatch = setCookie.match(/session=([^;]+)/);
  const newSessionCookie = sessionMatch ? `session=${sessionMatch[1]}` : "";

  const json = (await res.json()) as AgentRouterResponse;

  return {
    userData: json.data as Record<string, unknown>,
    sessionCookie: newSessionCookie || cookieValue,
  };
}

/**
 * Step 3: Get user self data (verify session is active)
 */
async function getUserSelf(
  cookieValue: string,
  prisma: any,
  logId: number
): Promise<AgentRouterResponse> {
  const headers = {
    Cookie: cookieValue,
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Cache-Control": "no-store",
    Referer: `${AGENT_ROUTER_BASE}/console`,
  };

  const url = `${AGENT_ROUTER_BASE}/api/user/self`;
  const res = await fetch(url, {
    method: "GET",
    headers,
  });

  // Log the request
  await logRequest(
    prisma,
    logId,
    "GET /api/user/self",
    "GET",
    url,
    headers,
    res.status
  );

  return (await res.json()) as AgentRouterResponse;
}

/**
 * Step 2: Get GitHub OAuth authorization URL
 * This calls the local authorize endpoint which returns Location header with GitHub authorize URL
 */
async function getAuthorizationUrl(
  cookieId: number,
  prisma: any,
  logId: number
): Promise<{ location: string; authorize_url: string; sessionCookie: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const url = `${baseUrl}/api/oauth/github/authorize?cookieId=${cookieId}`;
  const headers = {
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method: "GET",
    headers,
  });

  // Log the request
  await logRequest(
    prisma,
    logId,
    "GET /api/oauth/github/authorize",
    "GET",
    url,
    headers,
    res.status
  );

  if (!res.ok) {
    throw new Error(`Failed to get authorization URL: ${res.status}`);
  }

  const json = await res.json();

  return {
    location: json.location || "",
    authorize_url: json.authorize_url || "",
    sessionCookie: json.sessionCookie || "",
  };
}

/**
 * Execute a login action using the stored cookie
 * This uses a headless browser to perform the OAuth flow
 */
export async function executeLogin(
  agentRouterCookie: string,
  githubCookie: string,
  cookieId: number,
  prisma: any,
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
  prisma: any,
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
    // Create a minimal prisma client for validation without logging
    const { prisma: validatePrisma } = await import("@/lib/prisma");

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
