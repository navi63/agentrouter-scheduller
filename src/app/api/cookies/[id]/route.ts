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
  const { label, value, status } = body;

  const cookie = await prisma.cookie.update({
    where: { id: parseInt(id) },
    data: {
      ...(label && { label }),
      ...(value && { value }),
      ...(status && { status }),
    },
  });
  return NextResponse.json(cookie);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.cookie.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
