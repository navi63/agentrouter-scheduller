"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, CalendarClock, Activity, AlertCircle, Clock, ScrollText, ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";

function calculateTimeUntilSchedule(scheduleTime: string): { hours: number; minutes: number; seconds: number; totalSeconds: number } {
  const now = new Date();
  const [scheduleHours, scheduleMinutes] = scheduleTime.split(':').map(Number);
  const scheduleDate = new Date(now);
  scheduleDate.setHours(scheduleHours, scheduleMinutes, 0, 0);

  if (scheduleDate < now) {
    scheduleDate.setDate(scheduleDate.getDate() + 1);
  }

  const diff = scheduleDate.getTime() - now.getTime();
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, totalSeconds };
}

function formatTimeUntil(hours: number, minutes: number, seconds: number): string {
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

interface ProgressBarProps {
  scheduleTime: string;
}

function ProgressBar({ scheduleTime }: ProgressBarProps) {
  const [progress, setProgress] = useState(100);
  const [timeLeft, setTimeLeft] = useState(calculateTimeUntilSchedule(scheduleTime));
  const [duration, setDuration] = useState(timeLeft.totalSeconds);

  useEffect(() => {
    const initial = calculateTimeUntilSchedule(scheduleTime);
    setTimeLeft(initial);
    setDuration(initial.totalSeconds);
    setProgress(100);
  }, [scheduleTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTotalSeconds = prev.totalSeconds - 1;

        if (newTotalSeconds <= 0) {
          return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
        }

        return {
          hours: Math.floor(newTotalSeconds / 3600),
          minutes: Math.floor((newTotalSeconds % 3600) / 60),
          seconds: newTotalSeconds % 60,
          totalSeconds: newTotalSeconds,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [scheduleTime]);

  useEffect(() => {
    if (duration > 0) {
      const newProgress = (timeLeft.totalSeconds / duration) * 100;
      setProgress(Math.max(0, Math.min(100, newProgress)));
    }
  }, [timeLeft.totalSeconds, duration]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Time remaining</span>
        <span className="font-mono font-semibold text-indigo-400">
          {formatTimeUntil(timeLeft.hours, timeLeft.minutes, timeLeft.seconds)}
        </span>
      </div>
      <div className="relative h-2 bg-muted rounded-full overflow-hidden border border-border">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30s
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-muted/50 border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="h-4 w-4 bg-muted rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-12 bg-muted rounded mb-2"></div>
                <div className="h-3 w-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your automated router login system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-card border-border backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Cookies</CardTitle>
            <Cookie className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.activeCookies || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of {stats?.totalCookies || 0} total stored</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Schedules</CardTitle>
            <CalendarClock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.activeSchedules || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of {stats?.totalSchedules || 0} total configured</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Successful Actions</CardTitle>
            <Activity className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.successCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All time automated success</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Actions</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.failedCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Redeemed</CardTitle>
            <ArrowUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">${stats?.totalRedeemed?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground mt-1">All time balance increases</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Next Upcoming */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" />
              Next Scheduled Action
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.nextSchedules && stats.nextSchedules.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                {stats.nextSchedules.map((schedule: any, index: number) => (
                  <div
                    key={schedule.id}
                    className={`rounded-lg bg-muted/50 p-4 ${
                      index === 0 ? 'border-animated-card' : 'border border-border'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{schedule.name}</h3>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md border border-border">
                            {schedule.cookie.label}
                          </span>
                          <span className="text-xs bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 px-2 py-1 rounded-md">
                            {schedule.type}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-indigo-400">{schedule.time}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {index === 0 ? 'Next Up' : 'Today'}
                        </div>
                      </div>
                    </div>
                    {index === 0 && <ProgressBar scheduleTime={schedule.time} />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No active schedules configured for today.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Logs Preview */}
        <Card className="bg-card border-border col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-amber-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentLogs && stats.recentLogs.length > 0 ? (
                stats.recentLogs.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {log.schedule?.name || "Manual Action"}
                        <span className={`h-2 w-2 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {log.cookie?.label} • {log.actionType}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {new Date(log.executedAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No automated actions executed yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
