"use client";

import { useCallback, useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { Badge, Card, Shell } from "../components/sentinel-shell";
import { API_URL, formatWhen, getJson, toneFromSeverity, type AuditLog } from "../lib/api";
import { mockAuditLogs } from "../lib/mock-api";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (): Promise<AuditLog[]> => {
    const response = await getJson<{ logs: AuditLog[] }>("/api/audit-log?limit=100");
    return response.logs ?? [];
  }, []);

  useEffect(() => {
    let mounted = true;

    Promise.resolve()
      .then(fetchLogs)
      .then((auditLogs) => {
        if (mounted) {
          setLogs(auditLogs);
        }
      })
      .catch(() => {
        if (mounted) {
          setLogs(mockAuditLogs as AuditLog[]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [fetchLogs]);

  useEffect(() => {
    const socket = getSocket();
    const refresh = () => {
      void fetchLogs()
        .then(setLogs)
        .catch(() => setLogs(mockAuditLogs as AuditLog[]));
    };

    socket.on("audit_event", refresh);
    socket.on("risk_event", refresh);
    socket.on("procurement_event", refresh);

    return () => {
      socket.off("audit_event", refresh);
      socket.off("risk_event", refresh);
      socket.off("procurement_event", refresh);
    };
  }, [fetchLogs]);

  async function exportAuditLog() {
    try {
      const response = await fetch(`${API_URL}/api/audit-log?limit=500`);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sentinelops-audit-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      const data = JSON.stringify(logs, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sentinelops-audit-demo-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <Shell>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="m-0 text-2xl font-black">Audit Timeline</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgba(245,245,245,0.58)]">
              Governance events from upload inspection, Lobster Trap policy checks, and procurement analysis.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void exportAuditLog();
            }}
            className="rounded-md border border-[rgba(255,15,123,0.24)] px-3 py-2 text-xs font-semibold text-[rgba(245,245,245,0.78)] hover:border-[#ff0f7b] hover:text-white"
          >
            Export
          </button>
        </div>

        {error ? (
          <div className="rounded-md border border-[#ffb80055] bg-[rgba(255,184,0,0.12)] px-4 py-3 text-sm text-[#ffb800]">
            {error}
          </div>
        ) : null}

        <Card className="p-6">
          {loading ? (
            <div className="text-sm text-[rgba(245,245,245,0.62)]">Loading audit log...</div>
          ) : logs.length === 0 ? (
            <div className="text-sm text-[rgba(245,245,245,0.5)]">No audit events have been recorded yet.</div>
          ) : (
            <div className="relative pl-8">
              <div className="absolute bottom-2 left-[9px] top-2 w-px bg-[rgba(255,15,123,0.28)]" />
              {logs.map((event, index) => {
                const type = event.event_type ?? event.type ?? "Audit event";
                const message = event.message ?? event.reason ?? "Audit log entry recorded";
                const severity = toneFromSeverity(event.severity);

                return (
                  <article key={event.id ?? `${type}-${index}`} className="relative mb-7 last:mb-0">
                    <div className="absolute -left-[31px] top-1 h-5 w-5 rounded-full border-4 border-[#0a0a0f] bg-[#ff0f7b] shadow-[0_0_16px_rgba(255,15,123,0.8)]" />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="m-0 text-base font-bold">{type}</h2>
                        <Badge tone={severity}>{severity}</Badge>
                      </div>
                      <span className="text-xs text-[rgba(245,245,245,0.44)]">{formatWhen(event.created_at)}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[rgba(245,245,245,0.62)]">{message}</p>
                    <div className="mt-2 font-mono text-[11px] text-[rgba(245,245,245,0.34)]">ID: {event.id ?? "pending"}</div>
                  </article>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </Shell>
  );
}
