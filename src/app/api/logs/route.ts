import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const skip = (page - 1) * pageSize;

  const where = status && status !== "ALL" ? { status } : {};

  const [logs, total] = await Promise.all([
    prisma.log.findMany({
      where,
      orderBy: { executedAt: "desc" },
      skip,
      take: pageSize,
      include: {
        schedule: { select: { name: true } },
        cookie: { select: { label: true } },
      },
    }),
    prisma.log.count({ where }),
  ]);

  return NextResponse.json({
    logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
