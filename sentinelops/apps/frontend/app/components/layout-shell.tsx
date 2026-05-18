"use client";

import type { ReactNode } from "react";
import { Navbar } from "./Navbar";

export function LayoutShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5]">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_10%,rgba(255,15,123,0.12),transparent_28%),radial-gradient(circle_at_84%_6%,rgba(100,150,255,0.1),transparent_24%)]" />
      <Navbar />
      <main className="relative z-[1] px-4 py-6 lg:ml-[260px] lg:px-8">{children}</main>
    </div>
  );
}
