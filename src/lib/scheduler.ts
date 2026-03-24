import cron, { ScheduledTask } from "node-cron";
import { prisma } from "@/lib/prisma";
import { executeLogin, executeLogout } from "@/lib/agent-router";

const scheduledJobs = new Map<number, ScheduledTask>();

/**
 * Convert HH:mm time string to a cron expression for daily execution
 */
function timeToCron(time: string): string {
  const [hour, minute] = time.split(":");
  return `${minute} ${hour} * * *`;
}

/**
 * Execute a schedule's action(s)
 */
async function executeScheduleAction(scheduleId: number) {
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: { cookie: true },
  });

  if (!schedule || !schedule.isActive) return;

  console.log(
    `[Scheduler] Executing: ${schedule.name} (${schedule.type}) at ${new Date().toISOString()}`
  );

  const actions: string[] = [];
  if (schedule.type === "LOGIN" || schedule.type === "LOGIN_THEN_LOGOUT") {
    actions.push("LOGIN");
  }
  if (schedule.type === "LOGOUT" || schedule.type === "LOGIN_THEN_LOGOUT") {
    actions.push("LOGOUT");
  }

  for (const action of actions) {
    try {
      let result;
      if (action === "LOGIN") {
        result = await executeLogin(schedule.cookie.value);
      } else {
        result = await executeLogout(schedule.cookie.value);
      }

      // Update cookie status
      await prisma.cookie.update({
        where: { id: schedule.cookie.id },
        data: { status: result.success ? "ACTIVE" : "EXPIRED" },
      });

      // Create log entry
      await prisma.log.create({
        data: {
          scheduleId: schedule.id,
          cookieId: schedule.cookie.id,
          actionType: action,
          status: result.success ? "SUCCESS" : "FAILED",
          response: result.message,
        },
      });

      console.log(
        `[Scheduler] ${action} for ${schedule.cookie.label}: ${result.success ? "SUCCESS" : "FAILED"} - ${result.message}`
      );
    } catch (error) {
      console.error(`[Scheduler] Error executing ${action}:`, error);
      await prisma.log.create({
        data: {
          scheduleId: schedule.id,
          cookieId: schedule.cookie.id,
          actionType: action,
          status: "FAILED",
          response: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      });
    }
  }
}

/**
 * Register a single schedule as a cron job
 */
export function registerSchedule(scheduleId: number, time: string) {
  // Remove existing job if any
  unregisterSchedule(scheduleId);

  const cronExpression = timeToCron(time);
  const task = cron.schedule(cronExpression, () => {
    executeScheduleAction(scheduleId);
  });

  scheduledJobs.set(scheduleId, task);
  console.log(
    `[Scheduler] Registered schedule #${scheduleId} with cron: ${cronExpression}`
  );
}

/**
 * Unregister a cron job for a schedule
 */
export function unregisterSchedule(scheduleId: number) {
  const existing = scheduledJobs.get(scheduleId);
  if (existing) {
    existing.stop();
    scheduledJobs.delete(scheduleId);
    console.log(`[Scheduler] Unregistered schedule #${scheduleId}`);
  }
}

/**
 * Initialize all active schedules from the database
 */
export async function initializeScheduler() {
  console.log("[Scheduler] Initializing scheduler engine...");

  // Stop all existing jobs
  for (const [id, task] of scheduledJobs) {
    task.stop();
    scheduledJobs.delete(id);
  }

  // Load active schedules
  const activeSchedules = await prisma.schedule.findMany({
    where: { isActive: true },
  });

  for (const schedule of activeSchedules) {
    registerSchedule(schedule.id, schedule.time);
  }

  console.log(
    `[Scheduler] Initialized ${activeSchedules.length} active schedule(s)`
  );
}

/**
 * Get scheduler status info
 */
export function getSchedulerStatus() {
  return {
    activeJobs: scheduledJobs.size,
    jobIds: Array.from(scheduledJobs.keys()),
  };
}
