export const threats = [
  { id: "evt-2241", severity: "critical", message: "Prompt injection blocked in procurement upload", source: "UploadSvc", when: "1m ago" },
  { id: "evt-2238", severity: "high", message: "Vendor pricing anomaly exceeded review threshold", source: "GeminiProcure-2", when: "12m ago" },
  { id: "evt-2235", severity: "medium", message: "Document classification required manual audit", source: "Lobster Trap", when: "27m ago" },
] as const;

export const vendors = [
  { name: "Apex Stationery", score: 87, risk: "critical", status: "under review" },
  { name: "Northline Office Supplies", score: 24, risk: "low", status: "active" },
  { name: "DataBridge Corp", score: 71, risk: "high", status: "under review" },
  { name: "SecureVend Ltd", score: 12, risk: "low", status: "active" },
] as const;

export const auditEvents = [
  { id: "aud-001", type: "Injection detected", severity: "critical", message: "Unsafe prompt content blocked before Gemini analysis", when: "just now" },
  { id: "aud-002", type: "Document upload", severity: "info", message: "Procurement demo document uploaded to processing queue", when: "6m ago" },
  { id: "aud-003", type: "Policy enforced", severity: "high", message: "Lobster Trap policy GP-01 flagged scope mismatch", when: "18m ago" },
  { id: "aud-004", type: "Analysis complete", severity: "low", message: "Vendor findings saved with anomaly score and risk level", when: "34m ago" },
] as const;
