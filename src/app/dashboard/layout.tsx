import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { MobileSidebarProvider } from "@/components/mobile-menu-context";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MobileSidebarProvider>
      <div className="flex h-screen overflow-hidden bg-slate-950">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden bg-slate-900">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </MobileSidebarProvider>
  );
}
