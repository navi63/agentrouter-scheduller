import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const logs = await prisma.redemptionLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      cookie: {
        select: {
          label: true,
        },
      },
    },
  });
  return NextResponse.json(logs);
}
