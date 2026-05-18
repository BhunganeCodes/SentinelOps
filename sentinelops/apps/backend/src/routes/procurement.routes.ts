import { Router } from "express";
import { uploadMiddleware } from "../middleware/upload.middleware";
import { inspectPrompt, triggerDocumentAnalysis } from "../services/analysis.service";
import { createProcessingDocument } from "../services/document.service";
import { supabase } from "../lib/supabase";

const router = Router();

router.post("/inspect-prompt", async (req, res, next) => {
  try {
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt : "";
    const inspection = await inspectPrompt(prompt);

    if (!inspection.allowed) {
      res.status(403).json({
        status: "blocked",
        reason: inspection.reason
      });
      return;
    }

    res.status(200).json({
      status: "approved"
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
      .from("vendors")
      .select("id,document_id,vendor_name,price,anomaly_score,risk_level,suspicious_claim,created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Failed to load vendors: ${error.message}`);
    }

    res.status(200).json({
      vendors: data ?? []
    });
  } catch (error) {
    next(error);
  }
});

export default router;
