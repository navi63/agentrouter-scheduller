import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const [totalCookies, activeCookies, totalSchedules, activeSchedules, recentLogs, stats] =
    await Promise.all([
      prisma.cookie.count(),
      prisma.cookie.count({ where: { status: "ACTIVE" } }),
      prisma.schedule.count(),
      prisma.schedule.count({ where: { isActive: true } }),
      prisma.log.findMany({
        orderBy: { executedAt: "desc" },
        take: 5,
        include: {
          schedule: { select: { name: true } },
          cookie: { select: { label: true } },
        },
      }),
      prisma.log.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

  const redemptionLogs = await prisma.redemptionLog.findMany();
  const totalRedeemed = redemptionLogs.reduce((sum: number, log) => sum + parseFloat(log.nominal.replace(/[$,]/g, '')), 0);

  const successCount = stats.find((s: { status: string; _count: { status: number } }) => s.status === "SUCCESS")?._count?.status || 0;
  const failedCount = stats.find((s: { status: string; _count: { status: number } }) => s.status === "FAILED")?._count?.status || 0;

  // Get next upcoming schedule
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  const nextSchedule = await prisma.schedule.findFirst({
    where: {
      isActive: true,
      time: { gte: currentTime },
    },
    orderBy: { time: "asc" },
    include: {
      cookie: { select: { label: true } },
    },
  });

  return NextResponse.json({
    totalCookies,
    activeCookies,
    totalSchedules,
    activeSchedules,
    successCount,
    failedCount,
    recentLogs,
    nextSchedule,
    totalRedeemed,
  });
}
