export const threats = [
  { id: "evt-2241", severity: "critical", message: "Prompt injection blocked in procurement upload", source: "UploadSvc", when: "1m ago" },
  { id: "evt-2240", severity: "critical", message: "Lobster Trap flagged embedded SQL attempt in document body", source: "LobsterTrap", when: "3m ago" },
  { id: "evt-2239", severity: "high", message: "Unregistered vendor 'DataBridge Corp' attempted auto-approval bypass", source: "GeminiProcure-1", when: "7m ago" },
  { id: "evt-2238", severity: "high", message: "Vendor pricing anomaly exceeded review threshold", source: "GeminiProcure-2", when: "12m ago" },
  { id: "evt-2237", severity: "high", message: "Document contained mismatched declared intent vs actual content", source: "GovEngine", when: "16m ago" },
  { id: "evt-2236", severity: "medium", message: "Duplicate vendor entry detected across multiple procurement batches", source: "DedupSvc", when: "21m ago" },
  { id: "evt-2235", severity: "medium", message: "Document classification required manual audit", source: "LobsterTrap", when: "27m ago" },
  { id: "evt-2234", severity: "medium", message: "Vendor contract exceeded typical price range for category", source: "PriceAnalytics", when: "35m ago" },
  { id: "evt-2233", severity: "low", message: "Routine compliance check passed for Northline RFQ batch", source: "AuditSvc", when: "48m ago" },
  { id: "evt-2232", severity: "info", message: "New vendor registration completed for SecureVend Ltd", source: "VendorPortal", when: "1h ago" },
] as const;

export const vendors = [
  { name: "Apex Stationery", score: 87, risk: "critical", status: "under review" },
  { name: "DataBridge Corp", score: 71, risk: "high", status: "under review" },
  { name: "Pinnacle Logistics", score: 65, risk: "high", status: "flagged", suspicious_claim: "Exclusive off-book shipping rates quoted" },
  { name: "Northline Office Supplies", score: 24, risk: "low", status: "active" },
  { name: "SecureVend Ltd", score: 12, risk: "low", status: "active" },
  { name: "OmniCloud Solutions", score: 54, risk: "medium", status: "active", suspicious_claim: "Unverified security compliance documentation" },
  { name: "Titan Manufacturing", score: 92, risk: "critical", status: "suspended", suspicious_claim: "Urgent cash payment requested for bulk order" },
  { name: "Greenfield Analytics", score: 18, risk: "low", status: "active" },
] as const;

export const auditEvents = [
  { id: "aud-001", type: "Injection detected", severity: "critical", message: "Unsafe prompt content blocked before Gemini analysis", when: "just now" },
  { id: "aud-002", type: "Document upload", severity: "info", message: "Procurement demo document uploaded to processing queue", when: "6m ago" },
  { id: "aud-003", type: "Policy enforced", severity: "high", message: "Lobster Trap policy GP-01 flagged scope mismatch", when: "18m ago" },
  { id: "aud-004", type: "Analysis complete", severity: "low", message: "Vendor findings saved with anomaly score and risk level", when: "34m ago" },
  { id: "aud-005", type: "Vendor flagged", severity: "high", message: "Titan Manufacturing exceeded anomaly threshold; account suspended pending review", when: "42m ago" },
  { id: "aud-006", type: "Workflow failed", severity: "critical", message: "Document analysis pipeline crashed on malformed PDF input", when: "55m ago" },
  { id: "aud-007", type: "Compliance check", severity: "info", message: "Quarterly compliance audit passed for all active vendors", when: "1h ago" },
  { id: "aud-008", type: "Data export", severity: "low", message: "Audit log exported by admin user for regulatory review", when: "2h ago" },
] as const;

export const procurementReports = [
  {
    document_id: "doc-demo-001",
    status: "completed",
    summary: "Found 3 vendor finding(s); 2 high risk.",
    anomaly_score: 87,
    analysis_json: {
      vendors: [
        { vendor_name: "Apex Stationery", price: 12999, anomaly_score: 87, risk_level: "critical", suspicious_claim: "Urgent cash payment requested before delivery" },
        { vendor_name: "DataBridge Corp", price: 45000, anomaly_score: 71, risk_level: "high", suspicious_claim: "Unregistered entity with mismatched tax ID" },
        { vendor_name: "Northline Office Supplies", price: 3200, anomaly_score: 24, risk_level: "low", suspicious_claim: null },
      ]
    }
  },
  {
    document_id: "doc-demo-002",
    status: "completed",
    summary: "Found 2 vendor finding(s); 1 high risk.",
    anomaly_score: 65,
    analysis_json: {
      vendors: [
        { vendor_name: "Pinnacle Logistics", price: 87500, anomaly_score: 65, risk_level: "high", suspicious_claim: "Exclusive off-book shipping rates quoted outside contract" },
        { vendor_name: "Greenfield Analytics", price: 15000, anomaly_score: 18, risk_level: "low", suspicious_claim: null },
      ]
    }
  },
  {
    document_id: "doc-demo-003",
    status: "blocked",
    summary: "Document blocked by governance inspection: embedded prompt injection detected.",
    anomaly_score: 0,
    analysis_json: {
      vendors: [
        { vendor_name: "Unknown entity", price: null, anomaly_score: 0, risk_level: "medium", suspicious_claim: "Document contained unsafe SQL-like injection patterns" },
      ]
    }
  },
] as const;
