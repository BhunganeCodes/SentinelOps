// src/routes/ai.routes.ts
import { Router } from "express";
import { analyzeProcurementDocument } from "../services/gemini.service";
import { supabase } from "../lib/supabase";
import { inspectWithLobsterTrap } from "../services/lobster-trap.adapter";

const router = Router();

router.post("/analyze-document", async (req, res) => {
  try {
    const { documentText } = req.body;

    if (!documentText || typeof documentText !== "string") {
      return res.status(400).json({
        error: "documentText is required and must be a string",
      });
    }

    // ── Lobster Trap inspection ──────────────────────────────
    const verdict = await inspectWithLobsterTrap(documentText, {
      source: "ai-route",
      declared_intent: "procurement-analysis",
    });

    if (verdict && !verdict.allowed) {
      return res.status(403).json({
        success: false,
        error: "Request blocked by security policy",
        reason: verdict.reason,
        event_id: verdict.event_id,
      });
    }
    // ────────────────────────────────────────────────────────

    // Analyze document using Gemini
    const analysis = await analyzeProcurementDocument(documentText);

    // Save result to Supabase
    const { error } = await supabase.from("procurement_analysis").insert([
      {
        document_text: documentText,
        analysis_json: analysis,
        // Store risk metadata from Lobster Trap if flagged
        lobster_trap_flagged: verdict?.risk_delta ? verdict.risk_delta > 0 : false,
        lobster_trap_risk_delta: verdict?.risk_delta ?? 0,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
    }

    const score = analysis.anomaly_score;
    const riskLevel = score >= 0.8 ? "HIGH" : score >= 0.5 ? "MEDIUM" : "LOW";

    res.json({
      success: true,
      data: {
        ...analysis,
        risk_level: riskLevel,
        // Surface Lobster Trap metadata to the frontend if flagged
        ...(verdict?.risk_delta && verdict.risk_delta > 0 && {
          security_flag: {
            risk_delta: verdict.risk_delta,
            reason: verdict.reason,
            event_id: verdict.event_id,
          },
        }),
      },
    });
  } catch (error) {
    console.error("AI analysis failed:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze document",
    });
  }
});

router.get("/analyses", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("procurement_analysis")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error("Failed to fetch analyses:", error);
    res.status(500).json({ success: false, error: "Failed to fetch analyses" });
  }
});

export default router;