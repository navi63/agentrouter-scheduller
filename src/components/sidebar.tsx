"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Cookie, CalendarClock, ScrollText, Activity, ArrowUp, User, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`relative flex h-full flex-col bg-slate-950 text-slate-100 border-r border-slate-800 p-4 transition-all duration-300 ease-in-out ${isCollapsed ? "w-[76px]" : "w-64"}`}>
      
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 shadow-sm transition-colors hover:bg-slate-700 hover:text-slate-100 sm:flex"
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      <div className={`flex items-center gap-3 px-2 py-4 mb-6 transition-all duration-300 ${isCollapsed ? "justify-center" : "justify-start"}`}>
        <Activity className="h-6 w-6 shrink-0 text-emerald-500" />
        <span className={`text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 whitespace-nowrap transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}`}>
          Stitch Auto
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center gap-3 rounded-lg py-2.5 transition-all duration-200 overflow-hidden ${
                isActive
                  ? "bg-slate-800/80 text-emerald-400 shadow-sm border border-slate-700/50"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              } ${isCollapsed ? "justify-center px-0 w-10 mx-auto" : "px-3"}`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-emerald-400" : ""}`} />
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2 py-4">
        <div className={`py-2 text-xs text-slate-500/70 border-t border-slate-800/50 pt-4 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "text-center px-0 border-transparent opacity-0" : "px-2 opacity-100"}`}>
          <p>Stitch v1.0</p>
        </div>
      </div>
    </div>
  );
}
