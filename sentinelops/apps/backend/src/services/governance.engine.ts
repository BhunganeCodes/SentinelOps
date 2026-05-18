import { IntentMismatchEngine } from './intent-mismatch.engine'
import { RiskScorer } from './risk-scorer'

export type GovernanceAction = 'allow' | 'block' | 'flag'

export type GovernanceVerdict = {
  action: GovernanceAction
  policy_triggered?: string
  risk_delta: number
}

type Policy = {
  id: string
  name: string
  patterns: RegExp[]
  action: GovernanceAction
  risk_delta: number
}

const POLICIES: Policy[] = [
  {
    id: 'GP-01',
    name: 'Sensitive Data Exfiltration',
    patterns: [
      /banking\s*details/i,
      /bank\s*account/i,
      /credentials/i,
      /\bpassword\b/i,
      /\bsecret\b/i,
    ],
    action: 'block',
    risk_delta: 50,
  },
  {
    id: 'GP-02',
    name: 'Unauthorised External Access',
    patterns: [
      /(?:call|invoke|connect)\s+(?:external|third.party|unauthorised)\s+api/i,
      /send\s+data\s+to\s+https?:\/\//i,
      /exfiltrate/i,
      /bypass\s+(?:auth|security|firewall)/i,
    ],
    action: 'block',
    risk_delta: 40,
  },
  {
    id: 'GP-03',
    name: 'Prompt Injection',
    patterns: [
      /ignore\s+(?:all\s+)?previous\s+instructions/i,
      /ignore\s+all\s+instructions/i,
      /disregard\s+(?:your\s+)?training/i,
      /you\s+are\s+now/i,
      /reveal\s+(?:the\s+)?system\s+prompt/i,
      /delete\s+.*database/i,
      /drop\s+table/i,
    ],
    action: 'block',
    risk_delta: 60,
  },
  {
    id: 'GP-05',
    name: 'PII Exposure',
    patterns: [
      /\bsocial\s*security\b/i,
      /\bssn\b/i,
      /\bcredit\s*card\b/i,
      /\bpassport\b/i,
      /\bdriver['\u2019]?s?\s+license\b/i,
      /\bphone\s*number\b/i,
      /\bemail\s*address\b/i,
    ],
    action: 'flag',
    risk_delta: 20,
  },
  {
    id: 'GP-06',
    name: 'Excessive Permissions',
    patterns: [
      /grant\s+(?:all|admin|root|superuser)/i,
      /elevate\s+.*(?:privileges?|permissions?|access|role)/i,
      /access\s+.*(?:all|any)\s+.*(?:data|resource|file|record)/i,
      /modify\s+(?:system|config|setting)/i,
    ],
    action: 'block',
    risk_delta: 35,
  },
]

export class GovernanceEngine {
  private riskScorer: RiskScorer
  private intentEngine: IntentMismatchEngine

  constructor(riskScorer?: RiskScorer) {
    this.riskScorer = riskScorer ?? new RiskScorer()
    this.intentEngine = new IntentMismatchEngine()
  }

  evaluate(
    prompt: string,
    options?: { declared_intent?: string; detected_intent?: string },
  ): GovernanceVerdict {
    const trimmed = prompt.trim()
    if (!trimmed) {
      return { action: 'block', policy_triggered: 'Empty prompt', risk_delta: 20 }
    }

    for (const policy of POLICIES) {
      for (const pattern of policy.patterns) {
        if (pattern.test(trimmed)) {
          this.riskScorer.add(policy.risk_delta)
          return {
            action: policy.action,
            policy_triggered: `${policy.id} — ${policy.name}`,
            risk_delta: policy.risk_delta,
          }
        }
      }
    }

    if (options?.declared_intent && options?.detected_intent) {
      const mismatch = this.intentEngine.compare(options.declared_intent, options.detected_intent)
      if (mismatch.mismatch) {
        this.riskScorer.add(30)
        return {
          action: 'flag',
          policy_triggered: 'GP-04 — Intent Mismatch',
          risk_delta: 30,
        }
      }
    }

    return { action: 'allow', risk_delta: 0 }
  }

  getScore(): number {
    return this.riskScorer.getScore()
  }

  resetScore(): void {
    this.riskScorer.reset()
  }

  onLockdown(callback: (score: number) => void): void {
    this.riskScorer.onThreshold(80, callback)
  }
}
