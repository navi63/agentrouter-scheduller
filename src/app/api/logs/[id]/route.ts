import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logId = parseInt(id);

  if (isNaN(logId)) {
    return NextResponse.json({ error: "Invalid log ID" }, { status: 400 });
  }

  const log = await prisma.log.findUnique({
    where: { id: logId },
    include: {
      schedule: { select: { name: true } },
      cookie: { select: { label: true } },
      entries: {
        orderBy: { timestamp: "asc" },
      },
    },
  });

  if (!log) {
    return NextResponse.json({ error: "Log not found" }, { status: 404 });
  }

  return NextResponse.json(log);
}
