"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

export type LiveRiskEvent = {
  id?: string;
  event_id?: string;
  event_type?: string;
  severity?: string;
  reason?: string | null;
  source?: string | null;
  risk_delta?: number;
  created_at?: string;
};

export function useRiskEvents(): LiveRiskEvent[] {
  const [events, setEvents] = useState<LiveRiskEvent[]>([]);

  useEffect(() => {
    const socket = getSocket();

    const handleEvent = (payload: LiveRiskEvent) => {
      setEvents((prev) => [payload, ...prev].slice(0, 100));
    };

    socket.on("risk_event", handleEvent);

    return () => {
      socket.off("risk_event", handleEvent);
    };
  }, []);

  return events;
}
