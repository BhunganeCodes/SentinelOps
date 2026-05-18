import { Router } from "express";
import { uploadMiddleware } from "../middleware/upload.middleware";
import { inspectPrompt } from "../services/analysis.service";
import { triggerDocumentAnalysis } from "../services/workflow.orchestrator";
import { createProcessingDocument } from "../services/document.service";
import { supabase } from "../lib/supabase";

const router = Router();

router.post("/inspect-prompt", async (req, res, next) => {
  try {
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt : "";
    const inspection = await inspectPrompt(prompt, {
      source: typeof req.body?.source === "string" ? req.body.source : "api",
      document_id: typeof req.body?.document_id === "string" ? req.body.document_id : undefined,
      declared_intent: typeof req.body?.declared_intent === "string" ? req.body.declared_intent : undefined
    });

    if (!inspection.allowed) {
      res.status(403).json({
        status: "blocked",
        reason: inspection.reason,
        event_id: inspection.event_id,
        risk_delta: inspection.risk_delta
      });
      return;
    }

    res.status(200).json({
      status: inspection.risk_delta > 0 ? "flagged" : "approved",
      reason: inspection.reason,
      event_id: inspection.event_id,
      risk_delta: inspection.risk_delta
    });
  } catch (error) {
    next(error);
  }
});

router.post("/upload", uploadMiddleware.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({
        error: "A PDF or TXT file is required"
      });
      return;
    }

    const document = await createProcessingDocument(req.file);

    triggerDocumentAnalysis(document.id);

    res.status(200).json({
      document_id: document.id,
      status: document.status
    });
  } catch (error) {
    next(error);
  }
});

router.post("/analyze-document", async (req, res) => {
  res.status(202).json({
    status: "accepted",
    document_id: req.body?.document_id
  });
});

router.get("/vendors", async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("procurement_analysis")
      .select("id,document_id,supplier_names,pricing_details,anomaly_score,compliance_risks,created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Failed to load vendors: ${error.message}`);
    }

    const vendors = (data ?? []).flatMap((row) => {
      const pricingDetails = row.pricing_details as { vendors?: Array<Record<string, unknown>> } | null;
      const detailedVendors = Array.isArray(pricingDetails?.vendors) ? pricingDetails.vendors : [];

      if (detailedVendors.length > 0) {
        return detailedVendors.map((vendor) => ({
          id: row.id,
          document_id: row.document_id,
          vendor_name: String(vendor.vendor_name ?? vendor.name ?? "Unknown vendor"),
          price: typeof vendor.price === "number" ? vendor.price : null,
          anomaly_score: Number(vendor.anomaly_score ?? row.anomaly_score ?? 0),
          risk_level: String(vendor.risk_level ?? "medium"),
          suspicious_claim: typeof vendor.suspicious_claim === "string" ? vendor.suspicious_claim : null,
          created_at: row.created_at
        }));
      }

      const supplierNames = Array.isArray(row.supplier_names) ? row.supplier_names : [];
      return supplierNames.map((name: string) => ({
        id: row.id,
        document_id: row.document_id,
        vendor_name: name,
        price: null,
        anomaly_score: row.anomaly_score ?? 0,
        risk_level: riskLevelFromScore(Number(row.anomaly_score ?? 0)),
        suspicious_claim: null,
        created_at: row.created_at
      }));
    });

    res.status(200).json({
      vendors
    });
  } catch (error) {
    next(error);
  }
});

router.get("/risk-events", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 50);
    const offset = Number(req.query.offset ?? 0);

    const { data, error, count } = await supabase
      .from("governance_events")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + Math.max(1, limit) - 1);

    if (error) {
      throw new Error(`Failed to load risk events: ${error.message}`);
    }

    const events = (data ?? []).map((event) => ({
      ...event,
      event_type: event.action,
      severity: riskLevelFromScore(Number(event.risk_delta ?? 0)),
      reason: event.policy_triggered,
      prompt_excerpt: event.prompt_snippet
    }));

    res.status(200).json({
      events,
      total: count ?? events.length,
      page: Math.floor(offset / Math.max(1, limit)) + 1
    });
  } catch (error) {
    next(error);
  }
});

router.get("/audit-log", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 100);
    const severity = typeof req.query.severity === "string" ? req.query.severity : undefined;

    let query = supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Math.max(1, limit));

    if (severity) {
      query = query.eq("severity", severity);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to load audit log: ${error.message}`);
    }

    res.status(200).json({
      logs: data ?? []
    });
  } catch (error) {
    next(error);
  }
});

router.get("/procurement-report", async (req, res, next) => {
  try {
    const documentId = typeof req.query.document_id === "string" ? req.query.document_id : "";

    if (!documentId) {
      res.status(400).json({
        error: "document_id is required"
      });
      return;
    }

    const { data, error } = await supabase
      .from("procurement_analysis")
      .select("*")
      .eq("document_id", documentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      throw new Error(`Failed to load procurement report: ${error.message}`);
    }

    res.status(200).json({
      report: {
        ...data,
        status: "completed",
        analysis_json: {
          vendors: extractVendorsFromAnalysis(data)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

function extractVendorsFromAnalysis(row: Record<string, unknown>): Array<Record<string, unknown>> {
  const pricingDetails = row.pricing_details as { vendors?: Array<Record<string, unknown>> } | null;

  if (Array.isArray(pricingDetails?.vendors)) {
    return pricingDetails.vendors;
  }

  const supplierNames = Array.isArray(row.supplier_names) ? row.supplier_names : [];

  return supplierNames.map((name) => ({
    vendor_name: String(name),
    price: null,
    anomaly_score: Number(row.anomaly_score ?? 0),
    risk_level: riskLevelFromScore(Number(row.anomaly_score ?? 0)),
    suspicious_claim: null
  }));
}

function riskLevelFromScore(score: number): "low" | "medium" | "high" | "critical" {
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

export default router;
