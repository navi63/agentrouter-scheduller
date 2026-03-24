"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Cookie, CalendarClock, ScrollText, Activity } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Cookies", href: "/cookies", icon: Cookie },
  { name: "Scheduler", href: "/scheduler", icon: CalendarClock },
  { name: "Logs", href: "/logs", icon: ScrollText },
];

export function Sidebar() {
  const pathname = usePathname();

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
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
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

      <div className="mt-auto px-2 py-4 text-xs text-slate-600">
        <p>Stitch Automation v1.0</p>
      </div>
    </div>
  );
}
