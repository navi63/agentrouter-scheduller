import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const AGENT_ROUTER_BASE = process.env.AGENT_ROUTER_BASE || "https://agentrouter.org";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * API 2: Initiate GitHub OAuth authorization
 * This is step 2 in the OAuth flow after getOAuthState
 * 
 * Flow:
 * 1. Get GitHub cookies from database (githubCookie field)
 * 2. Call agentrouter /api/oauth/state with those cookies
 * 3. Use returned state to build GitHub authorize URL
 * 4. Response contains location with GitHub OAuth URL (the URL to hit next)
 * 5. User needs to navigate to that GitHub URL, which will redirect back with code
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cookieId = searchParams.get("cookieId");

  if (!cookieId) {
    return NextResponse.json(
      { error: "cookieId parameter is required" },
      { status: 400 }
    );
  }

  // Step 1: Get cookie record from database
  const cookieRecord = await prisma.cookie.findUnique({
    where: { id: parseInt(cookieId) },
  });

  if (!cookieRecord) {
    return NextResponse.json(
      { error: "Cookie not found" },
      { status: 404 }
    );
  }

  // Use GitHub cookies from the githubCookie field
  const githubCookie = cookieRecord.githubCookie;
  
  if (!githubCookie) {
    return NextResponse.json(
      { error: "No GitHub cookies found for this record" },
      { status: 400 }
    );
  }

  // Step 2: Call agentrouter's /api/oauth/state (API 1)
  // This uses the GitHub cookies to get an OAuth state
  const stateHeaders = {
    Cookie: githubCookie,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Cache-Control": "no-store",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: `${AGENT_ROUTER_BASE}/login`,
  };

  let stateRes;
  try {
    stateRes = await fetch(`${AGENT_ROUTER_BASE}/api/oauth/state`, {
      method: "GET",
      headers: stateHeaders,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to agentrouter.org" },
      { status: 503 }
    );
  }

  if (!stateRes.ok) {
    return NextResponse.json(
      { error: `Failed to get OAuth state: ${stateRes.status}` },
      { status: stateRes.status }
    );
  }

  const stateJson = await stateRes.json();
  if (!stateJson.success || !stateJson.data) {
    return NextResponse.json(
      { error: stateJson.message || "Failed to get OAuth state" },
      { status: 400 }
    );
  }

  const state = stateJson.data as string;

  // Extract new session cookie if set in response
  const setCookie = stateRes.headers.get("set-cookie") || "";
  const sessionMatch = setCookie.match(/session=([^;]+)/);
  const newSessionCookie = sessionMatch ? `session=${sessionMatch[1]}` : githubCookie;

  // Step 3: Build GitHub OAuth authorize URL using the state from step 2
  // This matches API 2 behavior - user should hit this URL next
  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.append("client_id", "Ov23lidtiR4LeVZvVRNL");
  githubAuthUrl.searchParams.append("redirect_uri", `${AGENT_ROUTER_BASE}/oauth/github`);
  githubAuthUrl.searchParams.append("scope", "user:email");
  githubAuthUrl.searchParams.append("state", state);

  // Step 4: Return the authorize URL as 'location' (the URL to hit next)
  // After user navigates to GitHub and authorizes, GitHub redirects with code
  return NextResponse.json({
    success: true,
    location: githubAuthUrl.toString(),
    state: state,
    sessionCookie: newSessionCookie,
    message: "Navigate to this URL to authorize with GitHub",
  });
}
