import { supabase } from "../lib/supabase";
import {
  getDocumentForAnalysis,
  readDocumentText,
  updateDocumentStatus
} from "./document.service";
import {
  analyzeDocumentText,
  inspectPrompt,
  type VendorFinding
} from "./analysis.service";
import { emitRealtimeEvent } from "./realtime.service";

export async function runWorkflow(documentId: string): Promise<void> {
  emitRealtimeEvent("procurement_event", {
    type: "upload_started",
    document_id: documentId,
    created_at: new Date().toISOString()
  });

  try {
    const document = await getDocumentForAnalysis(documentId);
    const text = await readDocumentText(document);
    const inspection = await inspectPrompt(text, {
      source: "upload",
      document_id: documentId
    });

    if (!inspection.allowed) {
      await updateDocumentStatus(documentId, "blocked");
      await saveProcurementAnalysis(documentId, inspection.reason ?? "Prompt inspection blocked the document", []);
      emitRealtimeEvent("procurement_event", {
        type: "analysis_blocked",
        document_id: documentId,
        reason: inspection.reason,
        created_at: new Date().toISOString()
      });
      return;
    }

    const findings = await analyzeDocumentText(text);
    await saveProcurementAnalysis(documentId, summarizeFindings(findings), findings);
    await updateDocumentStatus(documentId, "complete");

    emitRealtimeEvent("procurement_event", {
      type: "analysis_complete",
      document_id: documentId,
      vendor_count: findings.length,
      created_at: new Date().toISOString()
    });

    if (findings.some((finding) => finding.anomaly_score > 70)) {
      emitRealtimeEvent("procurement_event", {
        type: "anomaly_flagged",
        document_id: documentId,
        created_at: new Date().toISOString()
      });
    }
  } catch (error) {
    await updateDocumentStatus(documentId, "failed").catch(() => undefined);
    emitRealtimeEvent("procurement_event", {
      type: "analysis_failed",
      document_id: documentId,
      message: error instanceof Error ? error.message : "Unknown workflow error",
      created_at: new Date().toISOString()
    });
    throw error;
  }
}

export function triggerDocumentAnalysis(documentId: string): void {
  void runWorkflow(documentId).catch((error: unknown) => {
    console.error("Background document analysis failed", error);
  });
}

async function saveProcurementAnalysis(
  documentId: string,
  summary: string,
  findings: VendorFinding[]
): Promise<void> {
  const maxScore = findings.reduce(
    (highest, finding) => Math.max(highest, finding.anomaly_score),
    0
  );

  const { error } = await supabase.from("procurement_analysis").insert({
    document_id: documentId,
    supplier_names: findings.map((finding) => finding.vendor_name),
    pricing_details: {
      vendors: findings.map((finding) => ({
        vendor_name: finding.vendor_name,
        price: finding.price,
        anomaly_score: finding.anomaly_score,
        risk_level: finding.risk_level,
        suspicious_claim: finding.suspicious_claim
      }))
    },
    suspicious_clauses: findings
      .map((finding) => finding.suspicious_claim)
      .filter((claim): claim is string => Boolean(claim)),
    compliance_risks: findings.map((finding) => finding.risk_level),
    anomaly_score: maxScore,
    summary,
  });

  if (error) {
    throw new Error(`Failed to save procurement analysis: ${error.message}`);
  }
}

function summarizeFindings(findings: VendorFinding[]): string {
  const highRiskCount = findings.filter((finding) =>
    finding.risk_level === "high" || finding.risk_level === "critical"
  ).length;

  return `Found ${findings.length} vendor finding(s); ${highRiskCount} high risk.`;
}
