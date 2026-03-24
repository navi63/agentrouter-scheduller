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
  const { label, value } = body;

  if (!label || !value) {
    return NextResponse.json(
      { error: "Label and cookie value are required" },
      { status: 400 }
    );
  }

  const cookie = await prisma.cookie.create({
    data: { label, value, status: "UNKNOWN" },
  });
  return NextResponse.json(cookie, { status: 201 });
}
