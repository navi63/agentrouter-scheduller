import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Stitch Auto-Credit Automation",
  description: "Automate and schedule login/logout for agent routers to collect credits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.variable} font-sans h-full min-h-full bg-slate-900 text-slate-50 antialiased`}>
        <QueryProvider>
          <div className="min-h-screen">
            {children}
          </div>
          <Toaster theme="dark" position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
