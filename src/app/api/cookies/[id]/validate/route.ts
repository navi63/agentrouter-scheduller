import { prisma } from "@/lib/prisma";
import { validateCookie } from "@/lib/agent-router";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookie = await prisma.cookie.findUnique({
    where: { id: parseInt(id) },
  });

  if (!cookie) {
    return NextResponse.json({ error: "Cookie not found" }, { status: 404 });
  }

  const result = await validateCookie(cookie.value);
  const newStatus = result.isValid ? "ACTIVE" : "EXPIRED";

  await prisma.cookie.update({
    where: { id: parseInt(id) },
    data: { status: newStatus },
  });

  return NextResponse.json({
    status: newStatus,
    username: result.username,
    quota: result.quota,
  });
}
