import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const AGENT_ROUTER_BASE = process.env.AGENT_ROUTER_BASE || "https://agentrouter.org";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GitHub OAuth callback handler
 * This endpoint receives the authorization code from GitHub
 * and exchanges it with agentrouter.org
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state parameter" },
      { status: 400 }
    );
  }

  // Parse state to extract cookieId if present (format: "state|cookieId")
  const stateParts = state.split("|");
  const actualState = stateParts[0];
  const cookieId = stateParts[1] ? parseInt(stateParts[1]) : null;

  try {
    // Get the cookie record if cookieId is provided
    let cookieRecord = null;
    let agentRouterCookie = "";

    if (cookieId) {
      cookieRecord = await prisma.cookie.findUnique({
        where: { id: cookieId },
      });

      if (cookieRecord && cookieRecord.agentRouterCookie) {
        agentRouterCookie = cookieRecord.agentRouterCookie;
      }
    }

    if (!agentRouterCookie) {
      return NextResponse.json(
        { error: "Cookie not found or invalid" },
        { status: 404 }
      );
    }

    // Step 1: Call agentrouter's /api/oauth/state to get session
    const stateHeaders = {
      Cookie: agentRouterCookie,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
      Accept: "application/json, text/plain, */*",
      "Cache-Control": "no-store",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: `${AGENT_ROUTER_BASE}/login`,
    };

    const stateRes = await fetch(`${AGENT_ROUTER_BASE}/api/oauth/state`, {
      method: "GET",
      headers: stateHeaders,
    });

    if (!stateRes.ok) {
      throw new Error(`Failed to get OAuth state: ${stateRes.status}`);
    }

    const stateJson = await stateRes.json();
    if (!stateJson.success) {
      throw new Error(`Failed to get OAuth state: ${stateJson.message}`);
    }

    const oauthState = stateJson.data;

    // Extract new session cookie if set
    const setCookie = stateRes.headers.get("set-cookie") || "";
    const sessionMatch = setCookie.match(/session=([^;]+)/);
    const newSessionCookie = sessionMatch ? `session=${sessionMatch[1]}` : agentRouterCookie;

    // Step 2: Call agentrouter's /api/oauth/github with the code from GitHub
    const githubHeaders = {
      Cookie: newSessionCookie,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
      Accept: "application/json, text/plain, */*",
      "Cache-Control": "no-store",
      Referer: `${AGENT_ROUTER_BASE}/oauth/github?code=${code}&state=${oauthState}`,
    };

    const githubRes = await fetch(
      `${AGENT_ROUTER_BASE}/api/oauth/github?code=${code}&state=${oauthState}`,
      {
        method: "GET",
        headers: githubHeaders,
      }
    );

    if (!githubRes.ok) {
      throw new Error(`Failed to complete OAuth: ${githubRes.status}`);
    }

    const githubJson = await githubRes.json();
    if (!githubJson.success) {
      throw new Error(`Failed to complete OAuth: ${githubJson.message}`);
    }

    // Extract final session cookie
    const finalSetCookie = githubRes.headers.get("set-cookie") || "";
    const finalSessionMatch = finalSetCookie.match(/session=([^;]+)/);
    const finalSessionCookie = finalSessionMatch ? `session=${finalSessionMatch[1]}` : newSessionCookie;

    // Update the cookie record with the new session
    if (cookieId && cookieRecord) {
      await prisma.cookie.update({
        where: { id: cookieId },
        data: {
          agentRouterCookie: finalSessionCookie,
          status: "ACTIVE",
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "OAuth completed successfully",
      data: githubJson.data,
      cookie: finalSessionCookie,
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.json(
      {
        error: "OAuth failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
