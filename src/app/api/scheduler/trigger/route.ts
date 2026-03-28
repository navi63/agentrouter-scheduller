import { prisma } from "@/lib/prisma";
import { executeLogin, executeLogout } from "@/lib/agent-router";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();
  const { scheduleId } = body;

  if (!scheduleId) {
    return NextResponse.json(
      { error: "scheduleId is required" },
      { status: 400 }
    );
  }

  const schedule = await prisma.schedule.findUnique({
    where: { id: parseInt(scheduleId) },
    include: { cookie: true },
  });

  if (!schedule) {
    return NextResponse.json(
      { error: "Schedule not found" },
      { status: 404 }
    );
  }

  const results: Array<{
    actionType: string;
    status: string;
    message: string;
  }> = [];

  const actions: string[] = [];
  if (schedule.type === "LOGIN" || schedule.type === "LOGIN_THEN_LOGOUT") {
    actions.push("LOGIN");
  }
  if (schedule.type === "LOGOUT" || schedule.type === "LOGIN_THEN_LOGOUT") {
    actions.push("LOGOUT");
  }

  for (const action of actions) {
    // Create log entry with RUNNING status
    const log = await prisma.log.create({
      data: {
        scheduleId: schedule.id,
        cookieId: schedule.cookie.id,
        actionType: action,
        status: "RUNNING",
        response: "Execution in progress...",
      },
    });

    let result;
    if (action === "LOGIN") {
      const agentRouterCookie = schedule.cookie.agentRouterCookie || "";
      const githubCookie = schedule.cookie.githubCookie || "";
      result = await executeLogin(agentRouterCookie, githubCookie, schedule.cookie.id, prisma, log.id);
    } else {
      const agentRouterCookie = schedule.cookie.agentRouterCookie || "";
      const githubCookie = schedule.cookie.githubCookie || "";
      result = await executeLogout(agentRouterCookie, githubCookie, prisma, log.id);
    }

    // Update cookie status based on result
    await prisma.cookie.update({
      where: { id: schedule.cookie.id },
      data: { status: result.success ? "ACTIVE" : "EXPIRED" },
    });

    // Update log entry with final status
    await prisma.log.update({
      where: { id: log.id },
      data: {
        status: result.success ? "SUCCESS" : "FAILED",
        response: result.message,
      },
    });

    results.push({
      actionType: action,
      status: result.success ? "SUCCESS" : "FAILED",
      message: result.message,
    });
  }

  return NextResponse.json({ results });
}
