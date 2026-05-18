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
            <h1 className="m-0 text-[32px] font-black tracking-[-0.03em] leading-[1.1] bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
              Command Dashboard
            </h1>
            <p className="mt-2 max-w-[500px] text-sm leading-[1.6] text-[rgba(245,245,245,0.58)]">
              Live procurement, AI governance, and vendor-risk posture in one operational view.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-md border border-[rgba(255,15,123,0.18)] bg-[rgba(255,15,123,0.08)] px-4 py-2 text-xs font-bold text-[#ff0f7b] tracking-[0.05em] uppercase backdrop-blur-sm transition-all duration-300 hover:border-[rgba(255,15,123,0.35)]">
            <span className="w-2 h-2 rounded-full bg-[#ff0f7b] shadow-[0_0_8px_#ff0f7b] animate-pulse" />
            {loading ? "Loading live data" : "Live backend view"}
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-3 rounded-md border border-[rgba(255,184,0,0.35)] bg-[rgba(255,184,0,0.12)] px-5 py-3.5 text-sm text-[#ffb800] backdrop-blur-sm animate-[slideDown_0.4s_ease-out]">
            <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric 
            label="Blocked injections" 
            value={String(blockedCount || 0)} 
            tone="critical" 
            className="relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(17,17,24,0.72)] backdrop-blur-lg p-6 transition-all duration-350 hover:border-[rgba(255,15,123,0.18)] hover:bg-[rgba(22,22,32,0.85)] hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(255,15,123,0.08)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-[#ff1744] before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-350"
          />
          <Metric 
            label="Vendor findings" 
            value={String(liveVendors.length)} 
            tone="info"
            className="relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(17,17,24,0.72)] backdrop-blur-lg p-6 transition-all duration-350 hover:border-[rgba(255,15,123,0.18)] hover:bg-[rgba(22,22,32,0.85)] hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(255,15,123,0.08)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-[#00b0ff] before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-350"
          />
          <Metric 
            label="High risk vendors" 
            value={String(highRiskVendors)} 
            tone="high"
            className="relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(17,17,24,0.72)] backdrop-blur-lg p-6 transition-all duration-350 hover:border-[rgba(255,15,123,0.18)] hover:bg-[rgba(22,22,32,0.85)] hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(255,15,123,0.08)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-[#ffb800] before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-350"
          />
          <Metric 
            label="Clean analyses" 
            value={cleanAnalyses} 
            tone="low"
            className="relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(17,17,24,0.72)] backdrop-blur-lg p-6 transition-all duration-350 hover:border-[rgba(255,15,123,0.18)] hover:bg-[rgba(22,22,32,0.85)] hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(255,15,123,0.08)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-[#00e676] before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-350"
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="relative rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(17,17,24,0.72)] backdrop-blur-xl overflow-hidden transition-all duration-350 hover:border-[rgba(255,15,123,0.18)] hover:shadow-[0_0_40px_rgba(255,15,123,0.08)]">
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
                {liveThreats.length} events
              </span>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {liveThreats.map((event) => (
                <div key={event.id} className="grid gap-4 px-6 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center transition-colors duration-250 hover:bg-[rgba(255,255,255,0.02)]">
                  <Badge tone={event.severity} className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] border transition-all duration-200
                    ${event.severity === 'critical' ? 'bg-[rgba(255,23,68,0.12)] text-[#ff1744] border-[rgba(255,23,68,0.25)] shadow-[0_0_12px_rgba(255,23,68,0.15)]' : ''}
                    ${event.severity === 'high' ? 'bg-[rgba(255,184,0,0.12)] text-[#ffb800] border-[rgba(255,184,0,0.25)] shadow-[0_0_12px_rgba(255,184,0,0.15)]' : ''}
                    ${event.severity === 'medium' ? 'bg-[rgba(255,145,0,0.12)] text-[#ff9100] border-[rgba(255,145,0,0.25)]' : ''}
                    ${event.severity === 'low' ? 'bg-[rgba(0,230,118,0.12)] text-[#00e676] border-[rgba(0,230,118,0.25)] shadow-[0_0_12px_rgba(0,230,118,0.15)]' : ''}
                    ${event.severity === 'info' ? 'bg-[rgba(0,176,255,0.12)] text-[#00b0ff] border-[rgba(0,176,255,0.25)] shadow-[0_0_12px_rgba(0,176,255,0.15)]' : ''}">
                    {event.severity}
                  </Badge>
                  <div>
                    <div className="text-sm font-semibold leading-[1.4]">{event.message}</div>
                    <div className="mt-1 text-xs text-[rgba(245,245,245,0.38)] font-mono">{event.source} · {event.id}</div>
                  </div>
                  <div className="text-xs text-[rgba(245,245,245,0.38)] font-mono whitespace-nowrap">{event.when}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="relative rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(17,17,24,0.72)] backdrop-blur-xl overflow-hidden transition-all duration-350 hover:border-[rgba(255,15,123,0.18)] hover:shadow-[0_0_40px_rgba(255,15,123,0.08)]">
            <div className="flex items-center justify-between border-b border-[rgba(255,15,123,0.14)] px-6 py-5">
              <h2 className="m-0 text-[15px] font-bold tracking-[-0.01em] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-md bg-[rgba(255,15,123,0.12)] flex items-center justify-center text-[#ff0f7b]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </span>
                Audit pulse
              </h2>
              <span className="text-xs font-semibold text-[rgba(245,245,245,0.38)] px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.04)]">
                {liveAuditEvents.length} events
              </span>
            </div>
            <div className="p-6">
              <div className="relative pl-8">
                <div className="absolute bottom-8 left-[7px] top-4 w-0.5 rounded-full bg-gradient-to-b from-[#ff0f7b] to-[rgba(255,15,123,0.1)]" />
                {liveAuditEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="relative mb-7 last:mb-0">
                    <div className="absolute -left-[26px] top-1 w-3.5 h-3.5 rounded-full border-[3px] border-[#0a0a0f] bg-[#ff0f7b] shadow-[0_0_12px_rgba(255,15,123,0.4),0_0_24px_rgba(255,15,123,0.2)] animate-[dotPulse_3s_ease-in-out_infinite]" />
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-semibold">{event.type}</span>
                      <Badge tone={event.severity} className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] border transition-all duration-200
                        ${event.severity === 'critical' ? 'bg-[rgba(255,23,68,0.12)] text-[#ff1744] border-[rgba(255,23,68,0.25)] shadow-[0_0_12px_rgba(255,23,68,0.15)]' : ''}
                        ${event.severity === 'high' ? 'bg-[rgba(255,184,0,0.12)] text-[#ffb800] border-[rgba(255,184,0,0.25)] shadow-[0_0_12px_rgba(255,184,0,0.15)]' : ''}
                        ${event.severity === 'medium' ? 'bg-[rgba(255,145,0,0.12)] text-[#ff9100] border-[rgba(255,145,0,0.25)]' : ''}
                        ${event.severity === 'low' ? 'bg-[rgba(0,230,118,0.12)] text-[#00e676] border-[rgba(0,230,118,0.25)] shadow-[0_0_12px_rgba(0,230,118,0.15)]' : ''}
                        ${event.severity === 'info' ? 'bg-[rgba(0,176,255,0.12)] text-[#00b0ff] border-[rgba(0,176,255,0.25)] shadow-[0_0_12px_rgba(0,176,255,0.15)]' : ''}">
                        {event.severity}
                      </Badge>
                    </div>
                    <div className="mt-1.5 text-[13px] leading-[1.6] text-[rgba(245,245,245,0.54)]">{event.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <Card className="relative rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(17,17,24,0.72)] backdrop-blur-xl overflow-hidden transition-all duration-350 hover:border-[rgba(255,15,123,0.18)] hover:shadow-[0_0_40px_rgba(255,15,123,0.08)]">
          <div className="flex items-center justify-between border-b border-[rgba(255,15,123,0.14)] px-6 py-5">
            <h2 className="m-0 text-[15px] font-bold tracking-[-0.01em] flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-md bg-[rgba(255,15,123,0.12)] flex items-center justify-center text-[#ff0f7b]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              Vendor risk table
            </h2>
            <span className="text-xs font-semibold text-[rgba(245,245,245,0.38)] px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.04)]">
              {liveVendors.length} vendors
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.14em] text-[rgba(245,245,245,0.38)]">
                  <th className="px-6 py-3.5 font-semibold border-b border-[rgba(255,255,255,0.06)]">Vendor</th>
                  <th className="px-6 py-3.5 font-semibold border-b border-[rgba(255,255,255,0.06)]">Anomaly</th>
                  <th className="px-6 py-3.5 font-semibold border-b border-[rgba(255,255,255,0.06)]">Risk</th>
                  <th className="px-6 py-3.5 font-semibold border-b border-[rgba(255,255,255,0.06)]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                {liveVendors.map((vendor) => (
                  <tr key={vendor.name} className="transition-colors duration-200 hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="px-6 py-4 font-semibold text-sm">{vendor.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 font-bold text-[#ff0f7b] font-mono text-[15px]">{vendor.score}</span>
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-[#ff0f7b] to-[#ff5aa0] transition-all duration-800 ease-out relative after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-5 after:bg-gradient-to-r after:from-transparent after:to-white/30" 
                            style={{ width: `${vendor.score}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={vendor.risk} className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] border transition-all duration-200
                        ${vendor.risk === 'critical' ? 'bg-[rgba(255,23,68,0.12)] text-[#ff1744] border-[rgba(255,23,68,0.25)] shadow-[0_0_12px_rgba(255,23,68,0.15)]' : ''}
                        ${vendor.risk === 'high' ? 'bg-[rgba(255,184,0,0.12)] text-[#ffb800] border-[rgba(255,184,0,0.25)] shadow-[0_0_12px_rgba(255,184,0,0.15)]' : ''}
                        ${vendor.risk === 'medium' ? 'bg-[rgba(255,145,0,0.12)] text-[#ff9100] border-[rgba(255,145,0,0.25)]' : ''}
                        ${vendor.risk === 'low' ? 'bg-[rgba(0,230,118,0.12)] text-[#00e676] border-[rgba(0,230,118,0.25)] shadow-[0_0_12px_rgba(0,230,118,0.15)]' : ''}
                        ${vendor.risk === 'info' ? 'bg-[rgba(0,176,255,0.12)] text-[#00b0ff] border-[rgba(0,176,255,0.25)] shadow-[0_0_12px_rgba(0,176,255,0.15)]' : ''}">
                        {vendor.risk}
                      </Badge>
                    </td>
                    <td className={`px-6 py-4 text-[13px] ${vendor.status === 'under review' ? 'text-[#ffb800] font-semibold' : 'text-[rgba(245,245,245,0.64)]'}`}>
                      {vendor.status}
                    </td>
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