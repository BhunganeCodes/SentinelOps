import { Badge, Card, Metric, Shell } from "./components/sentinel-shell";
import { auditEvents, threats, vendors } from "./data";

export default function DashboardPage() {
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
            Phase 4 staging view
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="Blocked injections" value="14" tone="critical" />
          <Metric label="Vendor findings" value="38" tone="info" />
          <Metric label="High risk vendors" value="3" tone="high" />
          <Metric label="Clean analyses" value="92%" tone="low" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <div className="border-b border-[rgba(255,15,123,0.14)] px-5 py-4">
              <h2 className="m-0 text-base font-bold">Threat feed</h2>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.05)]">
              {threats.map((event) => (
                <div key={event.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                  <Badge tone={event.severity as "critical" | "high" | "medium"}>{event.severity}</Badge>
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
                {auditEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="relative mb-5 last:mb-0">
                    <div className="absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full border-2 border-[#0a0a0f] bg-[#ff0f7b] shadow-[0_0_10px_#ff0f7b]" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{event.type}</span>
                      <Badge tone={event.severity as "critical" | "high" | "low" | "info"}>{event.severity}</Badge>
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
                {vendors.map((vendor) => (
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
                    <td className="px-5 py-4"><Badge tone={vendor.risk as "critical" | "high" | "low"}>{vendor.risk}</Badge></td>
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
