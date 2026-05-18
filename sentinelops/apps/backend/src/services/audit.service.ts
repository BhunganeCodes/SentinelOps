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

export async function recordAuditLog(input: AuditInput): Promise<void> {
  const auditRow = {
    event_type: input.event_type,
    severity: input.severity ?? "info",
    message: input.message,
    document_id: input.document_id,
    metadata: input.metadata ?? {}
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
