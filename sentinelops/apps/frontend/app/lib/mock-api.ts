import type { AuditLog, ProcurementReport, RiskEvent, Vendor } from "./api";

const now = Date.now();

function ago(minutes: number): string {
  return new Date(now - minutes * 60 * 1000).toISOString();
}

export const mockRiskEvents: RiskEvent[] = [
  { id: "evt-2241", event_id: "evt-2241", event_type: "block", severity: "critical", reason: "Prompt injection blocked in procurement upload", source: "UploadSvc", risk_delta: 50, created_at: ago(1) },
  { id: "evt-2240", event_id: "evt-2240", event_type: "block", severity: "critical", reason: "Lobster Trap flagged embedded SQL attempt in document body", source: "LobsterTrap", risk_delta: 50, created_at: ago(3) },
  { id: "evt-2239", event_id: "evt-2239", event_type: "flag", severity: "high", reason: "Unregistered vendor 'DataBridge Corp' attempted auto-approval bypass", source: "GeminiProcure-1", risk_delta: 35, created_at: ago(7) },
  { id: "evt-2238", event_id: "evt-2238", event_type: "flag", severity: "high", reason: "Vendor pricing anomaly exceeded review threshold", source: "GeminiProcure-2", risk_delta: 30, created_at: ago(12) },
  { id: "evt-2237", event_id: "evt-2237", event_type: "flag", severity: "high", reason: "Document contained mismatched declared intent vs actual content", source: "GovEngine", risk_delta: 25, created_at: ago(16) },
  { id: "evt-2236", event_id: "evt-2236", event_type: "flag", severity: "medium", reason: "Duplicate vendor entry detected across multiple procurement batches", source: "DedupSvc", risk_delta: 15, created_at: ago(21) },
  { id: "evt-2235", event_id: "evt-2235", event_type: "flag", severity: "medium", reason: "Document classification required manual audit", source: "LobsterTrap", risk_delta: 15, created_at: ago(27) },
  { id: "evt-2234", event_id: "evt-2234", event_type: "flag", severity: "medium", reason: "Vendor contract exceeded typical price range for category", source: "PriceAnalytics", risk_delta: 10, created_at: ago(35) },
  { id: "evt-2233", event_id: "evt-2233", event_type: "allow", severity: "low", reason: "Routine compliance check passed for Northline RFQ batch", source: "AuditSvc", risk_delta: 0, created_at: ago(48) },
  { id: "evt-2232", event_id: "evt-2232", event_type: "allow", severity: "info", reason: "New vendor registration completed for SecureVend Ltd", source: "VendorPortal", risk_delta: 0, created_at: ago(60) },
];

export const mockVendors: Vendor[] = [
  { id: "ven-001", vendor_name: "Apex Stationery", price: 12999, anomaly_score: 87, risk_level: "critical", suspicious_claim: "Urgent cash payment requested before delivery", created_at: ago(10) },
  { id: "ven-002", vendor_name: "DataBridge Corp", price: 45000, anomaly_score: 71, risk_level: "high", suspicious_claim: "Unregistered entity with mismatched tax ID", created_at: ago(15) },
  { id: "ven-003", vendor_name: "Pinnacle Logistics", price: 87500, anomaly_score: 65, risk_level: "high", suspicious_claim: "Exclusive off-book shipping rates quoted outside contract", created_at: ago(20) },
  { id: "ven-004", vendor_name: "Northline Office Supplies", price: 3200, anomaly_score: 24, risk_level: "low", suspicious_claim: null, created_at: ago(30) },
  { id: "ven-005", vendor_name: "SecureVend Ltd", price: 5600, anomaly_score: 12, risk_level: "low", suspicious_claim: null, created_at: ago(45) },
  { id: "ven-006", vendor_name: "OmniCloud Solutions", price: 22000, anomaly_score: 54, risk_level: "medium", suspicious_claim: "Unverified security compliance documentation", created_at: ago(50) },
  { id: "ven-007", vendor_name: "Titan Manufacturing", price: 156000, anomaly_score: 92, risk_level: "critical", suspicious_claim: "Urgent cash payment requested for bulk order; vendor account suspended", created_at: ago(60) },
  { id: "ven-008", vendor_name: "Greenfield Analytics", price: 15000, anomaly_score: 18, risk_level: "low", suspicious_claim: null, created_at: ago(90) },
];

export const mockAuditLogs: AuditLog[] = [
  { id: "aud-001", event_type: "governance_block", severity: "critical", message: "Unsafe prompt content blocked before Gemini analysis", reason: "Pattern match: ignore previous instructions", created_at: ago(0) },
  { id: "aud-002", event_type: "upload_started", severity: "info", message: "Procurement demo document uploaded to processing queue", reason: null, created_at: ago(6) },
  { id: "aud-003", event_type: "governance_flag", severity: "high", message: "Lobster Trap policy GP-01 flagged scope mismatch", reason: "Prompt did not match declared intent", created_at: ago(18) },
  { id: "aud-004", event_type: "analysis_complete", severity: "low", message: "Vendor findings saved with anomaly score and risk level", reason: null, created_at: ago(34) },
  { id: "aud-005", event_type: "anomaly_flagged", severity: "high", message: "Titan Manufacturing exceeded anomaly threshold; account suspended pending review", reason: "Anomaly score 92 exceeded threshold 70", created_at: ago(42) },
  { id: "aud-006", event_type: "analysis_failed", severity: "critical", message: "Document analysis pipeline crashed on malformed PDF input", reason: "PDF parsing error: unexpected EOF in cross-reference table", created_at: ago(55) },
  { id: "aud-007", event_type: "compliance_check", severity: "info", message: "Quarterly compliance audit passed for all active vendors", reason: null, created_at: ago(60) },
  { id: "aud-008", event_type: "data_export", severity: "low", message: "Audit log exported by admin user for regulatory review", reason: "Export requested via admin console", created_at: ago(120) },
];

export const mockProcurementReports: Record<string, ProcurementReport> = {
  "doc-demo-001": {
    document_id: "doc-demo-001",
    status: "completed",
    summary: "Found 3 vendor finding(s); 2 high risk. Apex Stationery shows critical anomaly score with urgent cash payment request.",
    anomaly_score: 87,
    analysis_json: {
      vendors: [
        { vendor_name: "Apex Stationery", price: 12999, anomaly_score: 87, risk_level: "critical", suspicious_claim: "Urgent cash payment requested before delivery" },
        { vendor_name: "DataBridge Corp", price: 45000, anomaly_score: 71, risk_level: "high", suspicious_claim: "Unregistered entity with mismatched tax ID" },
        { vendor_name: "Northline Office Supplies", price: 3200, anomaly_score: 24, risk_level: "low", suspicious_claim: null },
      ]
    }
  },
  "doc-demo-002": {
    document_id: "doc-demo-002",
    status: "completed",
    summary: "Found 2 vendor finding(s); 1 high risk. Pinnacle Logistics quoted off-book shipping rates outside approved contract terms.",
    anomaly_score: 65,
    analysis_json: {
      vendors: [
        { vendor_name: "Pinnacle Logistics", price: 87500, anomaly_score: 65, risk_level: "high", suspicious_claim: "Exclusive off-book shipping rates quoted outside contract" },
        { vendor_name: "Greenfield Analytics", price: 15000, anomaly_score: 18, risk_level: "low", suspicious_claim: null },
      ]
    }
  },
};

let mockDocCounter = 3;

export function generateMockUploadResponse(fileName: string): { document_id: string; status: string } {
  mockDocCounter += 1;
  return {
    document_id: `doc-demo-${String(mockDocCounter).padStart(3, "0")}`,
    status: "processing",
  };
}

export function getMockProcurementReport(documentId: string): ProcurementReport | undefined {
  const report = mockProcurementReports[documentId];

  if (report) {
    return report;
  }

  if (documentId.startsWith("doc-demo")) {
    return {
      document_id: documentId,
      status: "completed",
      summary: "Found 3 vendor finding(s); 1 high risk. Analysis completed via demo pipeline.",
      anomaly_score: 54,
      analysis_json: {
        vendors: [
          { vendor_name: "OmniCloud Solutions", price: 22000, anomaly_score: 54, risk_level: "medium", suspicious_claim: "Unverified security compliance documentation" },
          { vendor_name: "SecureVend Ltd", price: 5600, anomaly_score: 12, risk_level: "low", suspicious_claim: null },
          { vendor_name: "Greenfield Analytics", price: 15000, anomaly_score: 18, risk_level: "low", suspicious_claim: null },
        ]
      }
    };
  }

  return undefined;
}
