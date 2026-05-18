"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Card } from "./sentinel-shell";
import { getJson, toneFromSeverity, type Vendor } from "../lib/api";

export type ProcurementInsightsProps = {
  vendors?: Vendor[];
};

export function ProcurementInsights({ vendors: initialVendors }: ProcurementInsightsProps) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors ?? []);
  const [loading, setLoading] = useState(!initialVendors);

  const fetchVendors = useCallback(async () => {
    try {
      const response = await getJson<{ vendors: Vendor[] }>("/api/vendors");
      setVendors(response.vendors ?? []);
    } catch {
      // keep existing data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialVendors) {
      fetchVendors();
    }
  }, [fetchVendors, initialVendors]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-sm text-[rgba(245,245,245,0.62)]">Loading vendor data...</div>
      </Card>
    );
  }

  if (vendors.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-sm text-[rgba(245,245,245,0.5)]">No vendors found. Upload a document to see procurement insights.</div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-[rgba(255,15,123,0.14)] px-6 py-5">
        <h2 className="m-0 text-[15px] font-bold tracking-[-0.01em]">Vendor risk table</h2>
        <span className="text-xs font-semibold text-[rgba(245,245,245,0.38)] px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.04)]">
          {vendors.length} vendors
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
            {vendors.map((vendor) => {
              const score = Math.round(Number(vendor.anomaly_score ?? vendor.score ?? 0));
              const risk = toneFromSeverity(vendor.risk_level ?? vendor.risk);
              const status = risk === "critical" || risk === "high" ? "under review" : "active";

              return (
                <tr key={vendor.id ?? vendor.vendor_name ?? vendor.name} className="transition-colors duration-200 hover:bg-[rgba(255,255,255,0.02)]">
                  <td className="px-6 py-4 font-semibold text-sm">{vendor.vendor_name ?? vendor.name ?? "Unknown vendor"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 font-bold text-[#ff0f7b] font-mono text-[15px]">{score}</span>
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#ff0f7b] to-[#ff5aa0]" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={risk}>{risk}</Badge>
                  </td>
                  <td className={`px-6 py-4 text-[13px] ${status === "under review" ? "text-[#ffb800] font-semibold" : "text-[rgba(245,245,245,0.64)]"}`}>
                    {status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
