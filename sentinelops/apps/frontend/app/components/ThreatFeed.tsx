"use client";

import { Badge, Card } from "./sentinel-shell";
import type { Tone } from "../lib/api";

export type ThreatEvent = {
  id: string;
  severity: Tone;
  message: string;
  source: string;
  when: string;
};

export type ThreatFeedProps = {
  events: ThreatEvent[];
};

export function ThreatFeed({ events }: ThreatFeedProps) {
  if (events.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12 text-sm text-[rgba(245,245,245,0.5)]">
          No threats detected
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-[rgba(255,15,123,0.14)] px-6 py-5">
        <h2 className="m-0 text-[15px] font-bold tracking-[-0.01em] flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-md bg-[rgba(255,15,123,0.12)] flex items-center justify-center text-[#ff0f7b]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </span>
          Threat feed
        </h2>
        <span className="text-xs font-semibold text-[rgba(245,245,245,0.38)] px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.04)]">
          {events.length} events
        </span>
      </div>
      <div className="divide-y divide-[rgba(255,255,255,0.04)]">
        {events.map((event) => (
          <div key={event.id} className="grid gap-4 px-6 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center transition-colors duration-250 hover:bg-[rgba(255,255,255,0.02)]">
            <Badge tone={event.severity}>{event.severity}</Badge>
            <div>
              <div className="text-sm font-semibold leading-[1.4]">{event.message}</div>
              <div className="mt-1 text-xs text-[rgba(245,245,245,0.38)] font-mono">{event.source} · {event.id}</div>
            </div>
            <div className="text-xs text-[rgba(245,245,245,0.38)] font-mono whitespace-nowrap">{event.when}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
