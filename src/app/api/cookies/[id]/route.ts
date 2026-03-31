import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Check if cookie belongs to user
  const existingCookie = await prisma.cookie.findUnique({
    where: { id: parseInt(id) },
    select: { userId: true },
  });

  if (!existingCookie) {
    return NextResponse.json({ error: "Cookie not found" }, { status: 404 });
  }

  if (existingCookie.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { label, agentRouterEntries, githubEntries, status } = body;

  const data: any = {};
  if (label) data.label = label;
  if (status) data.status = status;

  // Validate and process AgentRouter cookies
  if (agentRouterEntries) {
    const validEntries = agentRouterEntries.filter((e: { name: string; value: string }) => e.name && e.value);
    if (validEntries.length > 0) {
      data.agentRouterCookie = validEntries
        .map((entry: { name: string; value: string }) => `${entry.name}=${entry.value}`)
        .join('; ');
    } else {
      data.agentRouterCookie = null;
    }
  }

  // Validate and process GitHub cookies
  if (githubEntries) {
    const validEntries = githubEntries.filter((e: { name: string; value: string }) => e.name && e.value);
    if (validEntries.length > 0) {
      data.githubCookie = validEntries
        .map((entry: { name: string; value: string }) => `${entry.name}=${entry.value}`)
        .join('; ');
    } else {
      data.githubCookie = null;
    }
  }

  const cookie = await prisma.cookie.update({
    where: { id: parseInt(id) },
    data,
  });
  return NextResponse.json(cookie);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Check if cookie belongs to user
  const cookie = await prisma.cookie.findUnique({
    where: { id: parseInt(id) },
    select: { userId: true },
  });

  if (!cookie) {
    return NextResponse.json({ error: "Cookie not found" }, { status: 404 });
  }

  if (cookie.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.cookie.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
