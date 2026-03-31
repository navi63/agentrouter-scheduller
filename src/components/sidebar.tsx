"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Cookie, CalendarClock, ScrollText, Activity, ArrowUp, Clock, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Cookies", href: "/dashboard/cookies", icon: Cookie },
  { name: "Users", href: "/dashboard/users", icon: User },
  { name: "Scheduler", href: "/dashboard/scheduler", icon: CalendarClock },
  { name: "Logs", href: "/dashboard/logs", icon: ScrollText },
  { name: "Redemption Logs", href: "/dashboard/redemption-logs", icon: ArrowUp },
];

export function Sidebar() {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/session");
      if (!res.ok) return null;
      return res.json();
    },
  });

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Logged out successfully");
            window.location.href = "/login";
          },
        },
      });
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex h-full w-64 flex-col bg-slate-950 text-slate-100 border-r border-slate-800 p-4">
      <div className="flex items-center gap-2 px-2 py-4 mb-8">
        <Activity className="h-6 w-6 text-emerald-500" />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
          Stitch Auto-Credit
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                isActive
                  ? "bg-slate-800/80 text-emerald-400 shadow-sm border border-slate-700/50"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-emerald-400" : ""}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        {/* User Info */}
        {session?.user && (
          <div className="flex items-center gap-3 px-2 py-3 bg-slate-800/30 rounded-lg border border-slate-800/50">
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <User className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">
                {session.user.name || session.user.email}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-3 px-2 py-2.5 text-slate-400 hover:bg-red-950/30 hover:text-red-400 hover:border-red-500/30 border border-transparent"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </Button>

        {/* Time Display */}
        {mounted && (
          <div className="flex items-center gap-3 px-2 py-3 bg-slate-800/30 rounded-lg border border-slate-800/50">
            <Clock className="h-5 w-5 text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-slate-200">{formatTime(currentTime)}</span>
              <span className="text-xs text-slate-500">{formatDate(currentTime)}</span>
            </div>
          </div>
        )}

        <div className="px-2 py-4 text-xs text-slate-600">
          <p>Stitch Automation v1.0</p>
        </div>
      </div>
    </div>
  );
}
