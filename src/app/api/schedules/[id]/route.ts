import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, cookieId, time, frequency, type, isActive } = body;

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
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.schedule.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
