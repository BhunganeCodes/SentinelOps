import { describe, expect, it } from 'vitest'
import { IntentMismatchEngine } from '../services/intent-mismatch.engine'

describe('IntentMismatchEngine', () => {
  const engine = new IntentMismatchEngine()

  it('returns mismatch=false for identical intents', () => {
    const result = engine.compare('procurement document analysis', 'procurement document analysis')
    expect(result.mismatch).toBe(false)
    expect(result.score).toBe(0)
  })

  it('returns mismatch=false for closely related intents', () => {
    const result = engine.compare('procurement document analysis', 'analyze procurement document')
    // These share "procurement", "document", "analysis" / "analyze" (6+ chars match)
    expect(result.mismatch).toBe(false)
  })

  it('returns mismatch=true for divergent intents', () => {
    const result = engine.compare('procurement document analysis', 'delete all user data')
    expect(result.mismatch).toBe(true)
    expect(result.score).toBeGreaterThan(60)
  })

  it('returns mismatch=false when both intents are empty', () => {
    const result = engine.compare('', '')
    expect(result.mismatch).toBe(false)
    expect(result.score).toBe(0)
  })

  it('returns mismatch=true when one intent is empty', () => {
    const result = engine.compare('procurement analysis', '')
    expect(result.mismatch).toBe(true)
    expect(result.score).toBe(100)
  })

  it('handles single-word intents', () => {
    const result = engine.compare('hello', 'goodbye')
    expect(result.mismatch).toBe(true)
  })

  it('handles threshold boundary below threshold', () => {
    // 2 out of 3 tokens match => 33% score => below 60 threshold
    const result = engine.compare('alpha bravo charlie', 'alpha bravo delta')
    expect(result.mismatch).toBe(false)
    expect(result.score).toBeLessThanOrEqual(60)
  })

  it('handles threshold boundary above threshold', () => {
    // 0 out of 3 tokens match => 100% score => above 60 threshold
    const result = engine.compare('alpha bravo charlie', 'delta echo foxtrot')
    expect(result.mismatch).toBe(true)
    expect(result.score).toBeGreaterThan(60)
  })
})
