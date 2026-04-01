"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Cookie, CalendarClock, ScrollText, Activity, ArrowUp, User, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useMobileMenu } from "@/components/mobile-menu-context";

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
  const { isMobileOpen, setIsMobileOpen } = useMobileMenu();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-4 transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} ${isCollapsed ? "md:w-[76px] w-64" : "w-64"}`}>
        
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute right-4 top-5 z-10 p-1 text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground md:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Toggle Button (Desktop) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/60 shadow-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground sm:flex"
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
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center gap-3 rounded-lg py-2.5 transition-all duration-200 overflow-hidden ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm border border-sidebar-border/50"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground border border-transparent"
              } ${isCollapsed ? "justify-center px-0 w-10 mx-auto" : "px-3"}`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-sidebar-accent-foreground" : ""}`} />
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2 py-4">
        <div className={`py-2 text-xs text-sidebar-foreground/50 border-t border-sidebar-border pt-4 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "md:text-center md:px-0 md:border-transparent md:opacity-0 px-2 opacity-100" : "px-2 opacity-100"}`}>
          <p>Stitch v1.0</p>
        </div>
      </div>
    </div>
    </>
  );
}
