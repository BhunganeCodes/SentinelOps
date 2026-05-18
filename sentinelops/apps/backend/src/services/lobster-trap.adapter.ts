export type LobsterTrapVerdict = {
  allowed: boolean;
  reason?: string;
  risk_delta: number;
  policy_id?: string;
};

export type LobsterTrapContext = {
  source?: string;
  document_id?: string;
  declared_intent?: string;
};

export async function inspectWithLobsterTrap(
  _prompt: string,
  _context: LobsterTrapContext
): Promise<LobsterTrapVerdict | null> {
  // Plug-in seam for the real Veea Lobster Trap SDK/API.
  // Return null while credentials/integration details are not available so the
  // local governance heuristics remain deterministic for tests and demos.
  if (!process.env.LOBSTER_TRAP_KEY) {
    return null;
  }

  return null;
}
