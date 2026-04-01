"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Clock, LogOut, User, Menu } from "lucide-react";
import { useMobileMenu } from "@/components/mobile-menu-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const { setIsMobileOpen } = useMobileMenu();

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const response = await authClient.getSession();
      return response?.data || null;
    },
  });

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
      weekday: "short",
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-8 mx-auto max-w-6xl">
        {/* Left Side: Clock & Mobile Menu */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden shadow-sm outline-none focus:ring-1 focus:ring-ring"
          >
            <Menu className="h-4 w-4" />
          </button>
          
          {currentTime ? (
            <div className="flex items-center gap-3 bg-muted/40 px-3 py-1.5 rounded-full border border-border/50 shadow-sm transition-all hover:bg-muted/50">
              <Clock className="h-4 w-4 text-emerald-500/80" />
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-foreground tracking-wide text-sm">
                  {formatTime(currentTime)}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline-block">
                  {formatDate(currentTime)}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-8 w-40 animate-pulse bg-muted rounded-full"></div>
          )}
        </div>

        {/* Right Side: User Controls & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 relative h-9 w-fit pl-2 pr-4 transition-all duration-200 hover:bg-muted/80 hover:text-foreground rounded-full border border-border/40 shadow-sm bg-muted/40 text-left outline-none cursor-pointer focus:ring-1 focus:ring-ring">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
                  <User className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <span className="text-sm font-medium hidden sm:inline-block text-muted-foreground">
                  {session.user.name || session.user.email?.split('@')[0]}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-popover/95 backdrop-blur-md border-border text-popover-foreground mt-1 shadow-xl rounded-xl" align="end">
                <div className="px-2 pb-3 pt-2">
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-medium leading-none text-foreground">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-lg my-1 transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="h-9 w-32 animate-pulse bg-muted rounded-full"></div>
          )}
        </div>
      </div>
    </header>
  );
}
