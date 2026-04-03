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

  const userFilter = {
    userId: session.user.id,
  };

  const [totalCookies, activeCookies, totalSchedules, activeSchedules, recentLogs, stats] =
    await Promise.all([
      prisma.cookie.count({ where: userFilter }),
      prisma.cookie.count({ where: { ...userFilter, status: "ACTIVE" } }),
      prisma.schedule.count({
        where: {
          cookie: userFilter,
        },
      }),
      prisma.schedule.count({
        where: {
          cookie: userFilter,
          isActive: true,
        },
      }),
      prisma.log.findMany({
        where: {
          OR: [
            { cookie: userFilter },
            { schedule: { cookie: userFilter } },
          ],
        },
        orderBy: { executedAt: "desc" },
        take: 5,
        include: {
          schedule: { select: { name: true } },
          cookie: { select: { label: true } },
        },
      }),
      prisma.log.groupBy({
        by: ["status"],
        where: {
          OR: [
            { cookie: userFilter },
            { schedule: { cookie: userFilter } },
          ],
        },
        _count: { status: true },
      }),
    ]);

  const redemptionLogs = await prisma.redemptionLog.findMany({
    where: {
      cookie: userFilter,
    },
  });
  const totalRedeemed = (redemptionLogs || []).reduce((sum: number, log: { nominal?: string }) => {
    if (!log.nominal) return sum;
    const cleanValue = log.nominal.replace(/[$,]/g, '');
    const numericValue = parseFloat(cleanValue);
    return sum + (isNaN(numericValue) ? 0 : numericValue);
  }, 0);

  const successCount = stats.find((s: { status: string; _count: { status: number } }) => s.status === "SUCCESS")?._count?.status || 0;
  const failedCount = stats.find((s: { status: string; _count: { status: number } }) => s.status === "FAILED")?._count?.status || 0;

  // Get all upcoming schedules for today
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  const nextSchedules = await prisma.schedule.findMany({
    where: {
      cookie: userFilter,
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
    nextSchedules,
    totalRedeemed,
  });
}
