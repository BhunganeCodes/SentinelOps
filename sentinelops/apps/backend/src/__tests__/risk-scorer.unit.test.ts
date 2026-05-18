import { describe, expect, it } from 'vitest'
import { RiskScorer } from '../services/risk-scorer'

describe('RiskScorer', () => {
  it('starts at zero', () => {
    const scorer = new RiskScorer()
    expect(scorer.getScore()).toBe(0)
  })

  it('adds delta to running score', () => {
    const scorer = new RiskScorer()
    scorer.add(20)
    expect(scorer.getScore()).toBe(20)
    scorer.add(30)
    expect(scorer.getScore()).toBe(50)
  })

  it('caps score at 100', () => {
    const scorer = new RiskScorer()
    scorer.add(60)
    scorer.add(50)
    expect(scorer.getScore()).toBe(100)
  })

  it('never goes below 0', () => {
    const scorer = new RiskScorer()
    scorer.add(-50)
    expect(scorer.getScore()).toBe(0)
  })

  it('reset clears the score', () => {
    const scorer = new RiskScorer()
    scorer.add(50)
    scorer.reset()
    expect(scorer.getScore()).toBe(0)
  })

  it('fires threshold callback when score reaches threshold', () => {
    const scorer = new RiskScorer()
    let called = false
    scorer.onThreshold(50, (score) => {
      called = true
      expect(score).toBe(60)
    })
    scorer.add(30)
    expect(called).toBe(false)
    scorer.add(30)
    expect(called).toBe(true)
  })

  it('fires threshold callback only once per registration', () => {
    const scorer = new RiskScorer()
    let callCount = 0
    scorer.onThreshold(50, () => { callCount++ })
    scorer.add(60)
    expect(callCount).toBe(1)
    scorer.add(40)
    // still at 100 but already fired
    expect(callCount).toBe(1)
  })

  it('supports multiple threshold callbacks', () => {
    const scorer = new RiskScorer()
    let first = false
    let second = false
    scorer.onThreshold(30, () => { first = true })
    scorer.onThreshold(70, () => { second = true })
    scorer.add(40)
    expect(first).toBe(true)
    expect(second).toBe(false)
    scorer.add(40)
    expect(second).toBe(true)
  })
})
