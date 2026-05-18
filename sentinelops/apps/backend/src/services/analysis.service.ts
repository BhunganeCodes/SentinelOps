import { supabase } from "../lib/supabase";
import {
  getDocumentForAnalysis,
  readDocumentText,
  updateDocumentStatus
} from "./document.service";

type PromptInspectionResult = {
  allowed: boolean;
  reason?: string;
};

type VendorFinding = {
  vendor_name: string;
  price: number | null;
  anomaly_score: number;
  risk_level: "low" | "medium" | "high";
  suspicious_claim: string | null;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

const blockedPromptPatterns = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /reveal\s+(the\s+)?system\s+prompt/i,
  /delete\s+.*database/i,
  /drop\s+table/i,
  /service\s+role\s+key/i
];

export async function inspectPrompt(prompt: string): Promise<PromptInspectionResult> {
  const normalizedPrompt = prompt.trim();

  if (!normalizedPrompt) {
    return {
      allowed: false,
      reason: "Document did not contain inspectable text"
    };
  }

  const matchedPattern = blockedPromptPatterns.find((pattern) =>
    pattern.test(normalizedPrompt)
  );

  if (matchedPattern) {
    return {
      allowed: false,
      reason: `Blocked unsafe prompt content matching ${matchedPattern.source}`
    };
  }

  return { allowed: true };
}

export async function analyzeDocument(
  documentId: string,
  documentText?: string
): Promise<void> {
  const text = documentText ?? (await readDocumentText(await getDocumentForAnalysis(documentId)));
  const findings = await analyzeWithGemini(text);

  const { error: analysisError } = await supabase.from("procurement_analysis").insert({
    document_id: documentId,
    status: "completed",
    summary: summarizeFindings(findings)
  });

  if (analysisError) {
    throw new Error(`Failed to save procurement analysis: ${analysisError.message}`);
  }

  if (findings.length > 0) {
    const { error: vendorError } = await supabase.from("vendors").insert(
      findings.map((finding) => ({
        document_id: documentId,
        vendor_name: finding.vendor_name,
        price: finding.price,
        anomaly_score: finding.anomaly_score,
        risk_level: finding.risk_level,
        suspicious_claim: finding.suspicious_claim
      }))
    );

    if (vendorError) {
      throw new Error(`Failed to save vendor findings: ${vendorError.message}`);
    }
  }

  await updateDocumentStatus(documentId, "completed");
}

export function triggerDocumentAnalysis(documentId: string): void {
  void processUploadedDocument(documentId).catch((error: unknown) => {
    console.error("Background document analysis failed", error);
  });
}

export async function processUploadedDocument(documentId: string): Promise<void> {
  const document = await getDocumentForAnalysis(documentId);
  const text = await readDocumentText(document);
  const inspection = await inspectPrompt(text);

  if (!inspection.allowed) {
    await updateDocumentStatus(documentId, "blocked");
    await supabase.from("procurement_analysis").insert({
      document_id: documentId,
      status: "blocked",
      summary: inspection.reason ?? "Prompt inspection blocked the document"
    });
    return;
  }

  await analyzeDocument(documentId, text);
}

async function analyzeWithGemini(documentText: string): Promise<VendorFinding[]> {
  if (!process.env.GEMINI_API_KEY) {
    return analyzeWithLocalHeuristics(documentText);
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: [
                  "Extract procurement vendor findings from this document.",
                  "Return only JSON with a vendors array.",
                  "Each vendor must include vendor_name, price, anomaly_score from 0 to 1, risk_level low|medium|high, and suspicious_claim.",
                  documentText
                ].join("\n\n")
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini analysis failed with status ${response.status}`);
  }

  const payload = (await response.json()) as GeminiResponse;
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    return analyzeWithLocalHeuristics(documentText);
  }

  return normalizeFindings(JSON.parse(text));
}

function analyzeWithLocalHeuristics(documentText: string): VendorFinding[] {
  const vendorPattern =
    /(?:vendor|supplier)\s*[:\-]\s*(?<name>[^\n,;]+).*?(?:price|total|amount)\s*[:\-]?\s*\$?(?<price>[0-9][0-9,]*(?:\.[0-9]{2})?)/gis;
  const findings: VendorFinding[] = [];
  let match: RegExpExecArray | null;

  while ((match = vendorPattern.exec(documentText)) !== null) {
    const name = match.groups?.name?.trim();
    const price = Number(match.groups?.price?.replace(/,/g, ""));

    if (!name) {
      continue;
    }

    const suspiciousClaim = findSuspiciousClaim(documentText);
    const anomalyScore = suspiciousClaim || price > 10000 ? 0.87 : 0.24;

    findings.push({
      vendor_name: name,
      price: Number.isFinite(price) ? price : null,
      anomaly_score: anomalyScore,
      risk_level: anomalyScore >= 0.75 ? "high" : anomalyScore >= 0.45 ? "medium" : "low",
      suspicious_claim: suspiciousClaim
    });
  }

  if (findings.length === 0) {
    findings.push({
      vendor_name: "Unknown vendor",
      price: null,
      anomaly_score: 0.5,
      risk_level: "medium",
      suspicious_claim: "No structured vendor line could be extracted"
    });
  }

  return findings;
}

function findSuspiciousClaim(documentText: string): string | null {
  const suspiciousLine = documentText
    .split(/\r?\n/)
    .find((line) => /urgent|exclusive|cash|unverified|off[- ]?book|wire/i.test(line));

  return suspiciousLine?.trim() ?? null;
}

function normalizeFindings(value: unknown): VendorFinding[] {
  const vendors = Array.isArray(value)
    ? value
    : typeof value === "object" && value !== null && "vendors" in value
      ? (value as { vendors?: unknown }).vendors
      : [];

  if (!Array.isArray(vendors)) {
    return [];
  }

  return vendors
    .map((vendor): VendorFinding | null => {
      if (typeof vendor !== "object" || vendor === null) {
        return null;
      }

      const record = vendor as Record<string, unknown>;
      const riskLevel = String(record.risk_level ?? "medium").toLowerCase();

      return {
        vendor_name: String(record.vendor_name ?? record.name ?? "Unknown vendor"),
        price: typeof record.price === "number" ? record.price : Number(record.price) || null,
        anomaly_score: clampScore(Number(record.anomaly_score ?? 0.5)),
        risk_level:
          riskLevel === "low" || riskLevel === "medium" || riskLevel === "high"
            ? riskLevel
            : "medium",
        suspicious_claim:
          typeof record.suspicious_claim === "string" ? record.suspicious_claim : null
      };
    })
    .filter((vendor): vendor is VendorFinding => vendor !== null);
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0.5;
  }

  return Math.max(0, Math.min(1, score));
}

function summarizeFindings(findings: VendorFinding[]): string {
  const highRiskCount = findings.filter((finding) => finding.risk_level === "high").length;

  return `Found ${findings.length} vendor finding(s); ${highRiskCount} high risk.`;
}
