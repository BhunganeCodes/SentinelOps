export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type Tone = "critical" | "high" | "medium" | "low" | "info";

export type RiskEvent = {
  id?: string;
  event_id?: string;
  event_type?: string;
  severity?: string;
  reason?: string | null;
  source?: string | null;
  risk_delta?: number;
  created_at?: string;
};

export type Vendor = {
  id?: string;
  vendor_name?: string;
  name?: string;
  price?: number | null;
  anomaly_score?: number;
  score?: number;
  risk_level?: string;
  risk?: string;
  suspicious_claim?: string | null;
  created_at?: string;
};

export type AuditLog = {
  id?: string;
  event_type?: string;
  type?: string;
  severity?: string;
  message?: string;
  reason?: string | null;
  created_at?: string;
};

export type ProcurementReport = {
  document_id?: string;
  status?: string;
  summary?: string;
  anomaly_score?: number;
  analysis_json?: {
    vendors?: Vendor[];
  };
};

export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function formatWhen(value?: string): string {
  if (!value) {
    return "just now";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) {
    return `${seconds || 1}s ago`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function toneFromSeverity(severity?: string): Tone {
  const normalized = severity?.toLowerCase();

  if (normalized === "critical" || normalized === "block") {
    return "critical";
  }

  if (normalized === "high") {
    return "high";
  }

  if (normalized === "medium" || normalized === "flag") {
    return "medium";
  }

  if (normalized === "low" || normalized === "allow") {
    return "low";
  }

  return "info";
}
