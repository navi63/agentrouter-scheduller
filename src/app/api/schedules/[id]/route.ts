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

  // Check if schedule belongs to user (via cookie)
  const existingSchedule = await prisma.schedule.findUnique({
    where: { id: parseInt(id) },
    select: { cookie: { select: { userId: true } } },
  });

  if (!existingSchedule) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }

  if (existingSchedule.cookie.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, cookieId, time, frequency, type, isActive } = body;

  // If updating cookieId, verify new cookie belongs to user
  if (cookieId !== undefined) {
    const cookie = await prisma.cookie.findUnique({
      where: { id: parseInt(cookieId) },
      select: { userId: true },
    });

    if (!cookie || cookie.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: Cookie does not belong to you" },
        { status: 403 }
      );
    }
  }

  const schedule = await prisma.schedule.update({
    where: { id: parseInt(id) },
    data: {
      ...(name !== undefined && { name }),
      ...(cookieId !== undefined && { cookieId: parseInt(cookieId) }),
      ...(time !== undefined && { time }),
      ...(frequency !== undefined && { frequency }),
      ...(type !== undefined && { type }),
      ...(isActive !== undefined && { isActive }),
    },
    include: {
      cookie: { select: { id: true, label: true, status: true } },
    },
  });
  return NextResponse.json(schedule);
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

  // Check if schedule belongs to user (via cookie)
  const schedule = await prisma.schedule.findUnique({
    where: { id: parseInt(id) },
    select: { cookie: { select: { userId: true } } },
  });

  if (!schedule) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }

  if (schedule.cookie.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.schedule.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
