import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const schedules = await prisma.schedule.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      cookie: { select: { id: true, label: true, status: true } },
    },
  });
  return NextResponse.json(schedules);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, cookieId, time, frequency, type } = body;

  if (!name || !cookieId || !time || !type) {
    return NextResponse.json(
      { error: "Name, cookieId, time, and type are required" },
      { status: 400 }
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
