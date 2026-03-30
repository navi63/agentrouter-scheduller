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
 * Detect if a time string is in cron format or HH:mm format
 */
function isCronExpression(time: string): boolean {
  // Cron format has 5 parts separated by spaces
  const cronPattern = /^[0-9\-\*\/,]+\s+[0-9\-\*\/,]+\s+[0-9\-\*\/,]+\s+[0-9\-\*\/,]+\s+[0-9\-\*\/,]+$/;
  return cronPattern.test(time);
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
    let log: any = null;
    const maxRetries = 3;
    let retryCount = 0;
    let success = false;

    while (retryCount < maxRetries && !success) {
      try {
        // Create log entry with RUNNING status
        if (!log) {
          log = await prisma.log.create({
            data: {
              scheduleId: schedule.id,
              cookieId: schedule.cookie.id,
              actionType: action,
              status: "RUNNING",
              response: "Execution in progress...",
            },
          });
        }

        console.log(
          `[Scheduler] Started ${action} for ${schedule.cookie.label} (Log ID: ${log.id})${retryCount > 0 ? ` (Attempt ${retryCount + 1}/${maxRetries})` : ""}`
        );

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

        if (result.success) {
          // Update cookie status
          await prisma.cookie.update({
            where: { id: schedule.cookie.id },
            data: { status: "ACTIVE" },
          });

          // Update log entry with final status
          await prisma.log.update({
            where: { id: log.id },
            data: {
              status: "SUCCESS",
              response: result.message,
            },
          });

          success = true;
          console.log(
            `[Scheduler] ${action} for ${schedule.cookie.label}: SUCCESS - ${result.message}`
          );
        } else {
          retryCount++;

          if (retryCount < maxRetries) {
            console.log(
              `[Scheduler] ${action} for ${schedule.cookie.label} failed (Attempt ${retryCount}/${maxRetries}): ${result.message}. Retrying...`
            );
            // Wait before retry (2 seconds)
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            // All retries exhausted
            await prisma.cookie.update({
              where: { id: schedule.cookie.id },
              data: { status: "EXPIRED" },
            });

            await prisma.log.update({
              where: { id: log.id },
              data: {
                status: "FAILED",
                response: `Failed after ${maxRetries} attempts: ${result.message}`,
              },
            });

            console.log(
              `[Scheduler] ${action} for ${schedule.cookie.label}: FAILED after ${maxRetries} attempts - ${result.message}`
            );
          }
        }
      } catch (error) {
        retryCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.error(`[Scheduler] Error executing ${action} (Attempt ${retryCount}/${maxRetries}):`, error);

        if (retryCount < maxRetries) {
          console.log(
            `[Scheduler] ${action} for ${schedule.cookie.label} encountered an error. Retrying...`
          );
          // Wait before retry (2 seconds)
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          // All retries exhausted
          if (log) {
            await prisma.cookie.update({
              where: { id: schedule.cookie.id },
              data: { status: "EXPIRED" },
            });

            await prisma.log.update({
              where: { id: log.id },
              data: {
                status: "FAILED",
                response: `Failed after ${maxRetries} attempts: ${errorMessage}`,
              },
            });
          }
        }
      }
    }
  }
}

/**
 * Register a single schedule as a cron job
 */
export function registerSchedule(scheduleId: number, time: string) {
  // Remove existing job if any
  unregisterSchedule(scheduleId);

  // Check if time is already in cron format or needs conversion from HH:mm
  const cronExpression = isCronExpression(time) ? time : timeToCron(time);
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
