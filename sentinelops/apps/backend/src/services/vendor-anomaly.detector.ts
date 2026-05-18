export type VendorAnomalyInput = {
  price_inflation?: number;
  unknown_entity?: boolean;
  suspicious_clauses?: number;
};

export type RiskLevel = "low" | "medium" | "high" | "critical";

export function scoreVendorAnomaly(vendorData: VendorAnomalyInput): number {
  const priceScore = (vendorData.price_inflation ?? 0) > 0.3 ? 30 : 0;
  const unknownEntityScore = vendorData.unknown_entity ? 25 : 0;
  const suspiciousClauseScore = Math.min(vendorData.suspicious_clauses ?? 0, 3) * 10;

  return Math.min(priceScore + unknownEntityScore + suspiciousClauseScore, 100);
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 85) {
    return "critical";
  }

  if (score >= 70) {
    return "high";
  }

  if (score >= 40) {
    return "medium";
  }

  return "low";
}
