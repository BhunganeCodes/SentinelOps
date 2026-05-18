import { supabase } from "../lib/supabase";
import { emitRealtimeEvent } from "./realtime.service";
import { getRiskLevel, scoreVendorAnomaly } from "./vendor-anomaly.detector";

type PromptInspectionResult = {
  allowed: boolean;
  reason?: string;
  event_id?: string;
  risk_delta: number;
};

export type VendorFinding = {
  vendor_name: string;
  price: number | null;
  anomaly_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
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

type PromptInspectionContext = {
  source?: string;
  document_id?: string;
  declared_intent?: string;
};

export async function inspectPrompt(
  prompt: string,
  context: PromptInspectionContext = {}
): Promise<PromptInspectionResult> {
  const normalizedPrompt = prompt.trim();

  if (!normalizedPrompt) {
    return saveGovernanceEvent({
      allowed: false,
      reason: "Document did not contain inspectable text",
      risk_delta: 20,
      prompt,
      context
    });
  }

  const matchedPattern = blockedPromptPatterns.find((pattern) =>
    pattern.test(normalizedPrompt)
  );

  if (matchedPattern) {
    return saveGovernanceEvent({
      allowed: false,
      reason: `Blocked unsafe prompt content matching ${matchedPattern.source}`,
      risk_delta: 50,
      prompt,
      context
    });
  }

  if (context.declared_intent && !promptMatchesIntent(prompt, context.declared_intent)) {
    return saveGovernanceEvent({
      allowed: true,
      reason: "Prompt did not match declared intent",
      risk_delta: 15,
      prompt,
      context
    });
  }

  return saveGovernanceEvent({
    allowed: true,
    risk_delta: 0,
    prompt,
    context
  });
}

export async function analyzeDocumentText(documentText: string): Promise<VendorFinding[]> {
  return analyzeWithGemini(documentText);
}

async function analyzeWithGemini(documentText: string): Promise<VendorFinding[]> {
  if (!process.env.GEMINI_API_KEY) {
    return analyzeWithLocalHeuristics(documentText);
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
                  "Each vendor must include vendor_name, price, anomaly_score from 0 to 100, risk_level low|medium|high|critical, suspicious_claim, price_inflation, unknown_entity, and suspicious_clauses.",
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

  try {
    return normalizeFindings(JSON.parse(text));
  } catch (error) {
    console.warn("Gemini returned invalid JSON; falling back to local heuristics", error);
    return analyzeWithLocalHeuristics(documentText);
  }
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
    const anomalyScore = scoreVendorAnomaly({
      price_inflation: price > 10000 ? 0.35 : 0,
      unknown_entity: /unknown|unverified/i.test(name),
      suspicious_clauses: suspiciousClaim ? 3 : 0
    });

    findings.push({
      vendor_name: name,
      price: Number.isFinite(price) ? price : null,
      anomaly_score: anomalyScore,
      risk_level: getRiskLevel(anomalyScore),
      suspicious_claim: suspiciousClaim
    });
  }

  if (findings.length === 0) {
    findings.push({
      vendor_name: "Unknown vendor",
      price: null,
      anomaly_score: 40,
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
      const score = normalizeScore(Number(record.anomaly_score ?? NaN), record);

      return {
        vendor_name: String(record.vendor_name ?? record.name ?? "Unknown vendor"),
        price: typeof record.price === "number" ? record.price : Number(record.price) || null,
        anomaly_score: score,
        risk_level:
          riskLevel === "low" || riskLevel === "medium" || riskLevel === "high" || riskLevel === "critical"
            ? riskLevel
            : getRiskLevel(score),
        suspicious_claim:
          typeof record.suspicious_claim === "string" ? record.suspicious_claim : null
      };
    })
    .filter((vendor): vendor is VendorFinding => vendor !== null);
}

function normalizeScore(score: number, record: Record<string, unknown>): number {
  if (!Number.isFinite(score)) {
    return scoreVendorAnomaly({
      price_inflation: Number(record.price_inflation ?? 0),
      unknown_entity: Boolean(record.unknown_entity),
      suspicious_clauses: Number(record.suspicious_clauses ?? 0)
    });
  }

  const percentageScore = score <= 1 ? score * 100 : score;

  return Math.round(Math.max(0, Math.min(100, percentageScore)));
}

async function saveGovernanceEvent(input: {
  allowed: boolean;
  reason?: string;
  risk_delta: number;
  prompt: string;
  context: PromptInspectionContext;
}): Promise<PromptInspectionResult> {
  const eventType = input.allowed ? (input.risk_delta > 0 ? "flag" : "allow") : "block";
  const severity = input.allowed ? (input.risk_delta > 0 ? "medium" : "low") : "critical";

  const { data, error } = await supabase
    .from("governance_events")
    .insert({
      prompt_snippet: input.prompt.slice(0, 500),
      action: eventType,
      policy_triggered: input.reason ?? input.context.source ?? "Prompt inspection",
      risk_delta: input.risk_delta
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to save governance event: ${error.message}`);
  }

  const result = {
    allowed: input.allowed,
    reason: input.reason,
    event_id: data?.id ? String(data.id) : undefined,
    risk_delta: input.risk_delta
  };

  emitRealtimeEvent("risk_event", {
    ...result,
    event_type: eventType,
    severity,
    source: input.context.source ?? "api",
    document_id: input.context.document_id,
    created_at: new Date().toISOString()
  });

  return result;
}

function promptMatchesIntent(prompt: string, declaredIntent: string): boolean {
  const intentWords = declaredIntent
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 3);

  if (intentWords.length === 0) {
    return true;
  }

  const promptLower = prompt.toLowerCase();
  return intentWords.some((word) => promptLower.includes(word));
}
