import { supabase } from "../lib/supabase";
import { emitRealtimeEvent } from "./realtime.service";

type AuditSeverity = "info" | "low" | "medium" | "high" | "critical";

type AuditInput = {
  event_type: string;
  severity?: AuditSeverity;
  message: string;
  document_id?: string;
  metadata?: Record<string, unknown>;
};

function normalizeSeverity(severity?: string): "info" | "critical" {
  if (severity === "critical" || severity === "high") return "critical";
  return "info";
}

export async function recordAuditLog(input: AuditInput): Promise<void> {
  const auditRow: Record<string, unknown> = {
    event_type: input.event_type,
    severity: normalizeSeverity(input.severity),
    message: input.message,
  };

  const { data, error } = await supabase
    .from("audit_logs")
    .insert(auditRow)
    .select("id,created_at")
    .single();

  if (error) {
    throw new Error(`Failed to save audit log: ${error.message}`);
  }

  emitRealtimeEvent("audit_event", {
    ...auditRow,
    id: data?.id,
    created_at: data?.created_at ?? new Date().toISOString()
  });
}
