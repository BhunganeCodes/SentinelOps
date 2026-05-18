"use client";

import { Badge, Card } from "./sentinel-shell";
import { toneFromSeverity, formatWhen } from "../lib/api";
import type { Tone } from "../lib/api";

export type AuditLogEntry = {
  id?: string;
  type: string;
  severity: Tone;
  message: string;
  when: string;
};

export type AuditTimelineProps = {
  logs: AuditLogEntry[];
};

const severityBadgeTone: Record<string, Tone> = {
  info: "info",
  low: "low",
  medium: "medium",
  warning: "high",
  high: "high",
  critical: "critical",
};

export function AuditTimeline({ logs }: AuditTimelineProps) {
  if (logs.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-sm text-[rgba(245,245,245,0.5)]">No audit events have been recorded yet.</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="relative pl-8">
        <div className="absolute bottom-2 left-[9px] top-2 w-px bg-[rgba(255,15,123,0.28)]" />
        {logs.map((event, index) => {
          const badgeTone = severityBadgeTone[event.severity] ?? toneFromSeverity(event.severity);

          return (
            <article key={event.id ?? `${event.type}-${index}`} className="relative mb-7 last:mb-0">
              <div className="absolute -left-[31px] top-1 h-5 w-5 rounded-full border-4 border-[#0a0a0f] bg-[#ff0f7b] shadow-[0_0_16px_rgba(255,15,123,0.8)]" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="m-0 text-base font-bold">{event.type}</h2>
                  <Badge tone={badgeTone}>{badgeTone}</Badge>
                </div>
                <span className="text-xs text-[rgba(245,245,245,0.44)]">{event.when}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[rgba(245,245,245,0.62)]">{event.message}</p>
              <div className="mt-2 font-mono text-[11px] text-[rgba(245,245,245,0.34)]">ID: {event.id ?? "pending"}</div>
            </article>
          );
        })}
      </div>
    </Card>
  );
}
