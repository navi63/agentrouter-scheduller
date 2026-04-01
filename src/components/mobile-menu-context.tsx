"use client";

import { createContext, useContext, useState } from "react";

interface MobileMenuContextProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const MobileMenuContext = createContext<MobileMenuContextProps | undefined>(undefined);

export function MobileSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <MobileMenuContext.Provider value={{ isMobileOpen, setIsMobileOpen }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export function useMobileMenu() {
  const context = useContext(MobileMenuContext);
  if (!context) {
    throw new Error("useMobileMenu must be used within a MobileSidebarProvider");
  }
  return context;
}
