import { describe, expect, it } from "vitest";
import { getRiskLevel, scoreVendorAnomaly } from "../services/vendor-anomaly.detector";

describe("VendorAnomalyDetector", () => {
  it("scores guide-defined anomaly factors on a 0-100 scale", () => {
    expect(scoreVendorAnomaly({
      price_inflation: 0.4,
      unknown_entity: true,
      suspicious_clauses: 4
    })).toBe(85);
  });

  it("maps anomaly scores to canonical risk levels", () => {
    expect(getRiskLevel(12)).toBe("low");
    expect(getRiskLevel(45)).toBe("medium");
    expect(getRiskLevel(75)).toBe("high");
    expect(getRiskLevel(90)).toBe("critical");
  });
});
