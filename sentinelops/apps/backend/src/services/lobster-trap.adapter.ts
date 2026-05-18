export type LobsterTrapVerdict = {
  allowed: boolean;
  reason?: string;
  risk_delta: number;
  policy_id?: string;
  event_id?: string;
};

export type LobsterTrapContext = {
  source?: string;
  document_id?: string;
  declared_intent?: string;
};

export async function inspectWithLobsterTrap(
  prompt: string,
  context: LobsterTrapContext
): Promise<LobsterTrapVerdict | null> {
  const baseUrl = process.env.LOBSTER_TRAP_KEY;

  // Fall back gracefully if not configured (local dev / tests)
  if (!baseUrl) {
    console.warn("[LobsterTrap] LOBSTER_TRAP_KEY not set — skipping inspection");
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Declare intent so Lobster Trap can detect mismatches
        "_lobstertrap-intent": context.declared_intent ?? "procurement-analysis",
        "_lobstertrap-agent-id": "procurement-backend-v1",
        ...(context.document_id && { "_lobstertrap-document-id": context.document_id }),
        ...(context.source && { "_lobstertrap-source": context.source }),
      },
      body: JSON.stringify({
        model: "gemini-2.0-flash",
        messages: [{ role: "user", content: prompt }],
        // Signal to Lobster Trap this is an inspection-only call
        stream: false,
      }),
    });

    // DENY — Lobster Trap blocked the request
    if (response.status === 403 || response.status === 400) {
      const body = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
        event_id?: string;
      };
      return {
        allowed: false,
        reason: body?.error?.message ?? "Blocked by Lobster Trap policy",
        risk_delta: 1,
        event_id: body?.event_id,
      };
    }

    // HUMAN_REVIEW — flagged but allowed through
    if (response.headers.get("x-lobstertrap-action") === "HUMAN_REVIEW") {
      const body = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
        event_id?: string;
      };
      return {
        allowed: true,
        reason: "Flagged for human review",
        risk_delta: 0.7,
        event_id: body?.event_id,
      };
    }

    // ALLOW — clean response
    if (response.ok) {
      return {
        allowed: true,
        risk_delta: 0,
      };
    }

    // Unexpected status — fail open with a warning
    console.warn(`[LobsterTrap] Unexpected status ${response.status} — allowing request`);
    return null;

  } catch (err) {
    // Lobster Trap unreachable — fail open so your app keeps working
    console.error("[LobsterTrap] Inspection failed — failing open:", err);
    return null;
  }
}