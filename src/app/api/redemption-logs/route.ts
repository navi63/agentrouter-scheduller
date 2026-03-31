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

  const logs = await prisma.redemptionLog.findMany({
    where: {
      cookie: {
        userId: session.user.id,
      },
    },
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
