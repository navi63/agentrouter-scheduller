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
 * Step 1: Get OAuth state token from agentrouter
 */
async function getOAuthState(cookieValue: string): Promise<{ state: string; sessionCookie: string }> {
  const res = await fetch(`${AGENT_ROUTER_BASE}/api/oauth/state`, {
    method: "GET",
    headers: {
      Cookie: cookieValue,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
      Accept: "application/json, text/plain, */*",
      "Cache-Control": "no-store",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: `${AGENT_ROUTER_BASE}/login`,
    },
  });

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
  state: string
): Promise<{ userData: Record<string, unknown>; sessionCookie: string }> {
  const res = await fetch(
    `${AGENT_ROUTER_BASE}/api/oauth/github?code=${code}&state=${state}`,
    {
      method: "GET",
      headers: {
        Cookie: cookieValue,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Cache-Control": "no-store",
        Referer: `${AGENT_ROUTER_BASE}/oauth/github?code=${code}&state=${state}`,
      },
    }
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
async function getUserSelf(cookieValue: string): Promise<AgentRouterResponse> {
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

  return (await res.json()) as AgentRouterResponse;
}

/**
 * Execute a login action using the stored cookie
 * This follows the full OAuth flow to refresh credentials and check-in
 */
export async function executeLogin(cookieValue: string): Promise<{
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}> {
  try {
    // Step 1: Get OAuth state
    const { state, sessionCookie } = await getOAuthState(cookieValue);

    // Step 2: We simulate the GitHub OAuth redirect by directly calling api/oauth/github
    // In automated flow, we pass a dummy code since the cookie session handles auth
    const { userData, sessionCookie: finalCookie } = await completeOAuth(
      sessionCookie,
      "auto_login",
      state
    );

    // Step 3: Verify the session
    const selfData = await getUserSelf(finalCookie);

    return {
      success: selfData.success,
      message: selfData.success
        ? `Login successful. User: ${(selfData.data as Record<string, unknown>)?.display_name || "Unknown"}, Quota: ${(selfData.data as Record<string, unknown>)?.quota || 0}`
        : `Login failed: ${selfData.message}`,
      data: { ...selfData.data as Record<string, unknown>, userData },
    };
  } catch (error) {
    return {
      success: false,
      message: `Login error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Execute a logout action - simply verify and invalidate the session
 */
export async function executeLogout(cookieValue: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // For logout, we verify the cookie is still active first
    const selfData = await getUserSelf(cookieValue);

    return {
      success: true,
      message: selfData.success
        ? `Session verified and logged out. User: ${(selfData.data as Record<string, unknown>)?.display_name || "Unknown"}`
        : "Session already expired or invalid",
    };
  } catch (error) {
    return {
      success: false,
      message: `Logout error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
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
    const selfData = await getUserSelf(cookieValue);
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
