"use client";

import { Card, Badge } from "./sentinel-shell";

export type RiskCardProps = {
  score: number;
  label: string;
};

export function RiskCard({ score, label }: RiskCardProps) {
  const tone = score > 80 ? "critical" : score > 60 ? "high" : score > 30 ? "medium" : "low";

  return (
    <Card className={`relative overflow-hidden p-5 ${score > 80 ? "ring-2 ring-[#ff0f7b] shadow-[0_0_30px_rgba(255,15,123,0.2)]" : ""}`}>
      {score > 80 && (
        <div className="absolute top-0 left-0 right-0 bg-[#ff0f7b] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white text-center">
          Lockdown alert — risk threshold exceeded
        </div>
      )}
      <div className={`text-3xl font-black mt-1 ${score > 80 ? "text-[#ff0f7b]" : score > 60 ? "text-[#ff6400]" : score > 30 ? "text-[#ffb800]" : "text-[#00c878]"}`}>
        {score}
      </div>
      <div className="mt-2 text-xs uppercase tracking-[0.16em] text-[rgba(245,245,245,0.46)]">{label}</div>
      <div className="mt-3">
        <Badge tone={tone}>{tone}</Badge>
      </div>
    </Card>
  );
}
