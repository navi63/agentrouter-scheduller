import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const cookies = await prisma.cookie.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { schedules: true } },
    },
  });
  return NextResponse.json(cookies);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { label, agentRouterEntries, githubEntries } = body;

  if (!label) {
    return NextResponse.json(
      { error: "Label is required" },
      { status: 400 }
    );
  }

  // Validate and process AgentRouter cookies
  let agentRouterCookieString = null;
  if (agentRouterEntries && agentRouterEntries.length > 0) {
    const validEntries = agentRouterEntries.filter((e: { name: string; value: string }) => e.name && e.value);
    if (validEntries.length > 0) {
      agentRouterCookieString = validEntries
        .map((entry: { name: string; value: string }) => `${entry.name}=${entry.value}`)
        .join('; ');
    }
  }

  // Validate and process GitHub cookies
  let githubCookieString = null;
  if (githubEntries && githubEntries.length > 0) {
    const validEntries = githubEntries.filter((e: { name: string; value: string }) => e.name && e.value);
    if (validEntries.length > 0) {
      githubCookieString = validEntries
        .map((entry: { name: string; value: string }) => `${entry.name}=${entry.value}`)
        .join('; ');
    }
  }

  // At least one type of cookie must be provided
  if (!agentRouterCookieString && !githubCookieString) {
    return NextResponse.json(
      { error: "At least one valid cookie (AgentRouter or GitHub) must be provided" },
      { status: 400 }
    );
  }

  const data: any = { 
    label, 
    status: "UNKNOWN"
  };
  
  if (agentRouterCookieString) data.agentRouterCookie = agentRouterCookieString;
  if (githubCookieString) data.githubCookie = githubCookieString;

  const cookie = await prisma.cookie.create({ data });
  return NextResponse.json(cookie, { status: 201 });
}
