import { Badge, Card, Shell } from "../components/sentinel-shell";
import { auditEvents } from "../data";

export default function AuditPage() {
  return (
    <Shell>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div>
          <h1 className="m-0 text-2xl font-black">Audit Timeline</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgba(245,245,245,0.58)]">
            Governance events from upload inspection, Lobster Trap policy checks, and procurement analysis.
          </p>
        </div>

        <Card className="p-6">
          <div className="relative pl-8">
            <div className="absolute bottom-2 left-[9px] top-2 w-px bg-[rgba(255,15,123,0.28)]" />
            {auditEvents.map((event) => (
              <article key={event.id} className="relative mb-7 last:mb-0">
                <div className="absolute -left-[31px] top-1 h-5 w-5 rounded-full border-4 border-[#0a0a0f] bg-[#ff0f7b] shadow-[0_0_16px_rgba(255,15,123,0.8)]" />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="m-0 text-base font-bold">{event.type}</h2>
                    <Badge tone={event.severity}>{event.severity}</Badge>
                  </div>
                  <span className="text-xs text-[rgba(245,245,245,0.44)]">{event.when}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[rgba(245,245,245,0.62)]">{event.message}</p>
                <div className="mt-2 font-mono text-[11px] text-[rgba(245,245,245,0.34)]">ID: {event.id}</div>
              </article>
            ))}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
