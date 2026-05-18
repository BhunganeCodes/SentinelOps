"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "D" },
  { href: "/upload", label: "Upload", icon: "U" },
  { href: "/audit", label: "Audit", icon: "A" },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5]">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_10%,rgba(255,15,123,0.12),transparent_28%),radial-gradient(circle_at_84%_6%,rgba(100,150,255,0.1),transparent_24%)]" />
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[260px] border-r border-[rgba(255,15,123,0.14)] bg-[#0a0a0f] lg:flex lg:flex-col">
        <Link href="/" className="border-b border-[rgba(255,15,123,0.14)] px-5 py-5">
          <div className="text-[18px] font-black tracking-[0.24em] text-white">SENTINELOPS</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgba(245,245,245,0.42)]">
            Procurement command
          </div>
        </Link>
        <nav className="flex-1 px-2 py-4">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href === "/dashboard" && pathname === "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-1 flex items-center gap-3 rounded-md border-l-[3px] px-3 py-3 text-sm transition ${
                  active
                    ? "border-[#ff0f7b] bg-[rgba(255,15,123,0.1)] text-[#ff0f7b]"
                    : "border-transparent text-[rgba(245,245,245,0.68)] hover:bg-[rgba(255,15,123,0.06)] hover:text-white"
                }`}
              >
                <span className="w-5 text-center text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[rgba(255,15,123,0.14)] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#ff0f7b] to-[#ff2d95] text-xs font-bold">
              SO
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">Ops Analyst</div>
              <div className="truncate text-[11px] text-[rgba(245,245,245,0.44)]">Governance Console</div>
            </div>
          </div>
        </div>
      </aside>
      <header className="sticky top-0 z-10 border-b border-[rgba(255,15,123,0.14)] bg-[rgba(5,5,5,0.94)] px-4 py-3 backdrop-blur lg:ml-[260px] lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(245,245,245,0.42)]">Live workspace</div>
            <div className="text-lg font-bold">AI procurement intelligence</div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[rgba(0,200,120,0.28)] bg-[rgba(0,200,120,0.08)] px-3 py-1.5 text-xs font-semibold text-[#00c878]">
            <span className="h-2 w-2 rounded-full bg-[#00c878] shadow-[0_0_10px_#00c878]" />
            Ready
          </div>
        </div>
        <nav className="mt-3 flex gap-2 lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md border px-3 py-2 text-xs ${
                pathname === item.href || (item.href === "/dashboard" && pathname === "/")
                  ? "border-[#ff0f7b] bg-[rgba(255,15,123,0.1)] text-[#ff0f7b]"
                  : "border-[rgba(255,15,123,0.14)] text-[rgba(245,245,245,0.7)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="relative z-[1] px-4 py-6 lg:ml-[260px] lg:px-8">{children}</main>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-lg border border-[rgba(255,15,123,0.18)] bg-[rgba(17,17,17,0.88)] shadow-[0_0_20px_rgba(255,15,123,0.05),0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur ${className}`}
    >
      {children}
    </section>
  );
}

export function Badge({ tone, children }: { tone: "critical" | "high" | "medium" | "low" | "info"; children: ReactNode }) {
  const styles = {
    critical: "border-[#ff0f7b55] bg-[rgba(255,15,123,0.15)] text-[#ff0f7b]",
    high: "border-[#ff640055] bg-[rgba(255,100,0,0.15)] text-[#ff6400]",
    medium: "border-[#ffb80055] bg-[rgba(255,184,0,0.15)] text-[#ffb800]",
    low: "border-[#00c87855] bg-[rgba(0,200,120,0.15)] text-[#00c878]",
    info: "border-[#6496ff55] bg-[rgba(100,150,255,0.15)] text-[#6496ff]",
  };

  return (
    <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[tone]}`}>
      {children}
    </span>
  );
}

export function Metric({ label, value, tone = "info" }: { label: string; value: string; tone?: "critical" | "high" | "medium" | "low" | "info" }) {
  const color = {
    critical: "text-[#ff0f7b]",
    high: "text-[#ff6400]",
    medium: "text-[#ffb800]",
    low: "text-[#00c878]",
    info: "text-[#6496ff]",
  }[tone];

  return (
    <Card className="p-5">
      <div className={`text-3xl font-black ${color}`}>{value}</div>
      <div className="mt-2 text-xs uppercase tracking-[0.16em] text-[rgba(245,245,245,0.46)]">{label}</div>
    </Card>
  );
}
