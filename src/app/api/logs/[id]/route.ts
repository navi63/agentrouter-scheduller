import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const logId = parseInt(id);

  if (isNaN(logId)) {
    return NextResponse.json({ error: "Invalid log ID" }, { status: 400 });
  }

  const log = await prisma.log.findFirst({
    where: {
      id: logId,
      OR: [
        { cookie: { userId: session.user.id } },
        { schedule: { cookie: { userId: session.user.id } } },
      ],
    },
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
