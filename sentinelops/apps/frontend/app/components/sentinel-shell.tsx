"use client";

import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return <>{children}</>;
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

export function Badge({
  tone,
  children,
  className = ""
}: {
  tone: "critical" | "high" | "medium" | "low" | "info";
  children: ReactNode;
  className?: string;
}) {
  const styles = {
    critical: "border-[#ff0f7b55] bg-[rgba(255,15,123,0.15)] text-[#ff0f7b]",
    high: "border-[#ff640055] bg-[rgba(255,100,0,0.15)] text-[#ff6400]",
    medium: "border-[#ffb80055] bg-[rgba(255,184,0,0.15)] text-[#ffb800]",
    low: "border-[#00c87855] bg-[rgba(0,200,120,0.15)] text-[#00c878]",
    info: "border-[#6496ff55] bg-[rgba(100,150,255,0.15)] text-[#6496ff]",
  };

  return (
    <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function Metric({
  label,
  value,
  tone = "info",
  className = ""
}: {
  label: string;
  value: string;
  tone?: "critical" | "high" | "medium" | "low" | "info";
  className?: string;
}) {
  const color = {
    critical: "text-[#ff0f7b]",
    high: "text-[#ff6400]",
    medium: "text-[#ffb800]",
    low: "text-[#00c878]",
    info: "text-[#6496ff]",
  }[tone];

  return (
    <Card className={className || "p-5"}>
      <div className={`text-3xl font-black ${color}`}>{value}</div>
      <div className="mt-2 text-xs uppercase tracking-[0.16em] text-[rgba(245,245,245,0.46)]">{label}</div>
    </Card>
  );
}
