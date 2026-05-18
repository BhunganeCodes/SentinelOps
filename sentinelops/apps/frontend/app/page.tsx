"use client";

import { Badge, Card, Metric, Shell } from "./components/sentinel-shell";
import { auditEvents, threats, vendors } from "./data";
import { useCallback, useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import {
  formatWhen,
  getJson,
  toneFromSeverity,
  type AuditLog,
  type RiskEvent,
  type Vendor
} from "./lib/api";

type DashboardData = {
  riskEvents: RiskEvent[];
  vendors: Vendor[];
  auditLogs: AuditLog[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    riskEvents: [],
    vendors: [],
    auditLogs: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (): Promise<DashboardData> => {
    const [riskResponse, vendorResponse, auditResponse] = await Promise.all([
      getJson<{ events: RiskEvent[] }>("/api/risk-events?limit=20"),
      getJson<{ vendors: Vendor[] }>("/api/vendors"),
      getJson<{ logs: AuditLog[] }>("/api/audit-log?limit=20")
    ]);

    return {
      riskEvents: riskResponse.events ?? [],
      vendors: vendorResponse.vendors ?? [],
      auditLogs: auditResponse.logs ?? []
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    Promise.resolve()
      .then(fetchDashboard)
      .then((dashboardData) => {
        if (mounted) {
          setData(dashboardData);
        }
      })
      .catch(() => {
        if (mounted) {
          setError("Something went wrong while loading live operations data.");
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
  }, [fetchDashboard]);

  useEffect(() => {
    const socket = getSocket();
    const refresh = () => {
      void fetchDashboard()
        .then(setData)
        .catch(() => setError("Something went wrong while refreshing live operations data."));
    };

    socket.on("risk_event", refresh);
    socket.on("procurement_event", refresh);
    socket.on("audit_event", refresh);

    return () => {
      socket.off("risk_event", refresh);
      socket.off("procurement_event", refresh);
      socket.off("audit_event", refresh);
    };
  }, [fetchDashboard]);

  const liveThreats = data.riskEvents.length > 0
    ? data.riskEvents.map((event, index) => ({
      id: event.id ?? event.event_id ?? `risk-${index}`,
      severity: toneFromSeverity(event.severity ?? event.event_type),
      message: event.reason ?? event.event_type ?? "Governance event recorded",
      source: event.source ?? "Governance",
      when: formatWhen(event.created_at)
    }))
    : threats;

  const liveVendors = data.vendors.length > 0
    ? data.vendors.map((vendor) => {
      const score = Math.round(Number(vendor.anomaly_score ?? vendor.score ?? 0));
      const risk = toneFromSeverity(vendor.risk_level ?? vendor.risk);

      return {
        name: vendor.vendor_name ?? vendor.name ?? "Unknown vendor",
        score,
        risk,
        status: risk === "critical" || risk === "high" ? "under review" : "active"
      };
    })
    : vendors;

  const liveAuditEvents = data.auditLogs.length > 0
    ? data.auditLogs.map((event, index) => ({
      id: event.id ?? `audit-${index}`,
      type: event.event_type ?? event.type ?? "Audit event",
      severity: toneFromSeverity(event.severity),
      message: event.message ?? event.reason ?? "Audit log entry recorded",
      when: formatWhen(event.created_at)
    }))
    : auditEvents;

  const blockedCount = data.riskEvents.filter((event) =>
    (event.event_type ?? "").toLowerCase() === "block"
  ).length;
  const highRiskVendors = liveVendors.filter((vendor) => vendor.risk === "critical" || vendor.risk === "high").length;
  const cleanCount = liveVendors.filter((vendor) => vendor.risk === "low").length;
  const cleanAnalyses = liveVendors.length === 0
    ? "0%"
    : `${Math.round((cleanCount / liveVendors.length) * 100)}%`;

  return (
    <Shell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="m-0 text-2xl font-black tracking-tight">Command Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgba(245,245,245,0.58)]">
              Live procurement, AI governance, and vendor-risk posture in one operational view.
            </p>
          </div>
          <div className="rounded-md border border-[rgba(255,15,123,0.18)] bg-[rgba(255,15,123,0.08)] px-3 py-2 text-xs font-semibold text-[#ff0f7b]">
            {loading ? "Loading live data" : "Live backend view"}
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-[#ffb80055] bg-[rgba(255,184,0,0.12)] px-4 py-3 text-sm text-[#ffb800]">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="Blocked injections" value={String(blockedCount || 0)} tone="critical" />
          <Metric label="Vendor findings" value={String(liveVendors.length)} tone="info" />
          <Metric label="High risk vendors" value={String(highRiskVendors)} tone="high" />
          <Metric label="Clean analyses" value={cleanAnalyses} tone="low" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <div className="border-b border-[rgba(255,15,123,0.14)] px-5 py-4">
              <h2 className="m-0 text-base font-bold">Threat feed</h2>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.05)]">
              {liveThreats.map((event) => (
                <div key={event.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                  <Badge tone={event.severity}>{event.severity}</Badge>
                  <div>
                    <div className="text-sm font-semibold">{event.message}</div>
                    <div className="mt-1 text-xs text-[rgba(245,245,245,0.44)]">{event.source} · {event.id}</div>
                  </div>
                  <div className="text-xs text-[rgba(245,245,245,0.44)]">{event.when}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="border-b border-[rgba(255,15,123,0.14)] px-5 py-4">
              <h2 className="m-0 text-base font-bold">Audit pulse</h2>
            </div>
            <div className="p-5">
              <div className="relative pl-6">
                <div className="absolute bottom-0 left-[7px] top-1 w-px bg-[rgba(255,15,123,0.24)]" />
                {liveAuditEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="relative mb-5 last:mb-0">
                    <div className="absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full border-2 border-[#0a0a0f] bg-[#ff0f7b] shadow-[0_0_10px_#ff0f7b]" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{event.type}</span>
                      <Badge tone={event.severity}>{event.severity}</Badge>
                    </div>
                    <div className="mt-1 text-xs leading-5 text-[rgba(245,245,245,0.54)]">{event.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="border-b border-[rgba(255,15,123,0.14)] px-5 py-4">
            <h2 className="m-0 text-base font-bold">Vendor risk table</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.14em] text-[rgba(245,245,245,0.45)]">
                  <th className="px-5 py-3 font-semibold">Vendor</th>
                  <th className="px-5 py-3 font-semibold">Anomaly</th>
                  <th className="px-5 py-3 font-semibold">Risk</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {liveVendors.map((vendor) => (
                  <tr key={vendor.name}>
                    <td className="px-5 py-4 font-semibold">{vendor.name}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 font-bold text-[#ff0f7b]">{vendor.score}</span>
                        <div className="h-1.5 w-24 overflow-hidden rounded bg-[rgba(255,255,255,0.08)]">
                          <div className="h-full rounded bg-[#ff0f7b]" style={{ width: `${vendor.score}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><Badge tone={vendor.risk}>{vendor.risk}</Badge></td>
                    <td className="px-5 py-4 text-[rgba(245,245,245,0.64)]">{vendor.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
