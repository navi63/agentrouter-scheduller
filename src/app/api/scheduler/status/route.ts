import { initializeScheduler, getSchedulerStatus } from "@/lib/scheduler";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

let initialized = false;

export async function GET() {
  if (!initialized) {
    await initializeScheduler();
    initialized = true;
  }
  
  const status = getSchedulerStatus();
  return NextResponse.json({ 
    status: "running",
    ...status 
  });
}

export async function POST() {
  await initializeScheduler();
  initialized = true;
  
  const status = getSchedulerStatus();
  return NextResponse.json({ 
    status: "restarted",
    ...status 
  });
}
