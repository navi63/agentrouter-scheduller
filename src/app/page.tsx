"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, CalendarClock, Activity, AlertCircle, Clock, ScrollText } from "lucide-react";

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
            <Card key={i} className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 w-24 bg-slate-700 rounded"></div>
                <div className="h-4 w-4 bg-slate-700 rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-12 bg-slate-700 rounded mb-2"></div>
                <div className="h-3 w-32 bg-slate-700 rounded"></div>
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
        <p className="text-slate-400">Overview of your automated router login system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Cookies</CardTitle>
            <Cookie className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.activeCookies || 0}</div>
            <p className="text-xs text-slate-400 mt-1">Out of {stats?.totalCookies || 0} total stored</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Schedules</CardTitle>
            <CalendarClock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.activeSchedules || 0}</div>
            <p className="text-xs text-slate-400 mt-1">Out of {stats?.totalSchedules || 0} total configured</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Successful Actions</CardTitle>
            <Activity className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.successCount || 0}</div>
            <p className="text-xs text-slate-400 mt-1">All time automated success</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Failed Actions</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.failedCount || 0}</div>
            <p className="text-xs text-slate-400 mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Next Upcoming */}
        <Card className="bg-slate-800/60 border-slate-700 col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" />
              Next Scheduled Action
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.nextSchedule ? (
              <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{stats.nextSchedule.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md">
                      {stats.nextSchedule.cookie.label}
                    </span>
                    <span className="text-xs bg-indigo-950/50 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-md">
                      {stats.nextSchedule.type}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-indigo-400">{stats.nextSchedule.time}</div>
                  <div className="text-xs text-slate-500 mt-1">Today</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                No active schedules configured for today.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Logs Preview */}
        <Card className="bg-slate-800/60 border-slate-700 col-span-1">
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
                  <div key={log.id} className="flex items-center justify-between border-b border-slate-700/50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {log.schedule?.name || "Manual Action"}
                        <span className={`h-2 w-2 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {log.cookie?.label} • {log.actionType}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 text-right">
                      {new Date(log.executedAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
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
