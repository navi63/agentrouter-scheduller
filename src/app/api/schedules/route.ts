import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getSession(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schedules = await prisma.schedule.findMany({
    where: {
      cookie: {
        userId: session.user.id,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      cookie: { select: { id: true, label: true, status: true } },
    },
  });
  return NextResponse.json(schedules);
}

export async function POST(req: Request) {
  const session = await getSession(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, cookieId, time, frequency, type } = body;

  if (!name || !cookieId || !time || !type) {
    return NextResponse.json(
      { error: "Name, cookieId, time, and type are required" },
      { status: 400 }
    );
  }

  // Verify cookie belongs to user
  const cookie = await prisma.cookie.findUnique({
    where: { id: parseInt(cookieId) },
    select: { userId: true },
  });

  if (!cookie) {
    return NextResponse.json(
      { error: "Cookie not found" },
      { status: 404 }
    );
  }

  if (cookie.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Forbidden: Cookie does not belong to you" },
      { status: 403 }
    );
  }

  const schedule = await prisma.schedule.create({
    data: {
      name,
      cookieId: parseInt(cookieId),
      time,
      frequency: frequency || "DAILY",
      type,
    },
    include: {
      cookie: { select: { id: true, label: true, status: true } },
    },
  });
  return NextResponse.json(schedule, { status: 201 });
}
