import { unlink } from "node:fs/promises";
import { supabase } from "../lib/supabase";
import {
  getDocumentForAnalysis,
  readDocumentText,
  updateDocumentStatus
} from "./document.service";
import {
  analyzeDocumentText,
  type VendorFinding
} from "./analysis.service";
import { GovernanceEngine } from "./governance.engine";
import { recordAuditLog } from "./audit.service";
import { emitRealtimeEvent } from "./realtime.service";

export async function runWorkflow(documentId: string): Promise<void> {
  emitRealtimeEvent("procurement_event", {
    type: "upload_started",
    document_id: documentId,
    created_at: new Date().toISOString()
  });
  await recordAuditLog({
    event_type: "upload_started",
    severity: "info",
    message: "Document upload entered the procurement analysis workflow",
    document_id: documentId
  });

  const engine = new GovernanceEngine();
  let document: Awaited<ReturnType<typeof getDocumentForAnalysis>> | undefined;

  try {
    document = await getDocumentForAnalysis(documentId);
    const text = await readDocumentText(document);
    const inspection = engine.evaluate(text, {
      declared_intent: "procurement document analysis"
    });

    if (inspection.action === "block") {
      await updateDocumentStatus(documentId, "blocked");
      await saveProcurementAnalysis(documentId, inspection.policy_triggered ?? "Governance policy blocked the document", []);
      emitRealtimeEvent("procurement_event", {
        type: "analysis_blocked",
        document_id: documentId,
        reason: inspection.policy_triggered,
        created_at: new Date().toISOString()
      });
      await recordAuditLog({
        event_type: "analysis_blocked",
        severity: "critical",
        message: inspection.policy_triggered ?? "Document analysis blocked by governance policy",
        document_id: documentId
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
    await recordAuditLog({
      event_type: "analysis_complete",
      severity: findings.some((finding) => finding.anomaly_score > 70) ? "high" : "low",
      message: summarizeFindings(findings),
      document_id: documentId,
      metadata: {
        vendor_count: findings.length,
        max_anomaly_score: findings.reduce((highest, finding) => Math.max(highest, finding.anomaly_score), 0)
      }
    });

    if (findings.some((finding) => finding.anomaly_score > 70)) {
      emitRealtimeEvent("procurement_event", {
        type: "anomaly_flagged",
        document_id: documentId,
        created_at: new Date().toISOString()
      });
      engine.evaluate("High anomaly procurement document requires governance review", {
        declared_intent: "procurement risk review"
      });
    }
  } catch (error) {
    await updateDocumentStatus(documentId, "failed").catch(() => undefined);
    await recordAuditLog({
      event_type: "analysis_failed",
      severity: "critical",
      message: error instanceof Error ? error.message : "Unknown workflow error",
      document_id: documentId
    }).catch(() => undefined);
    emitRealtimeEvent("procurement_event", {
      type: "analysis_failed",
      document_id: documentId,
      message: error instanceof Error ? error.message : "Unknown workflow error",
      created_at: new Date().toISOString()
    });
    throw error;
  } finally {
    if (document?.file_path) {
      await unlink(document.file_path).catch(() => undefined);
    }
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
