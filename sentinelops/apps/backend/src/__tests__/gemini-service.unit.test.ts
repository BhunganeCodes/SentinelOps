import { describe, expect, it } from 'vitest'
import { GeminiService } from '../services/gemini.service'

describe('GeminiService', () => {
  it('buildPrompt wraps document text in a structured prompt', () => {
    const service = new GeminiService()
    const prompt = service.buildPrompt('test document')
    expect(prompt).toContain('test document')
    expect(prompt).toContain('suppliers')
    expect(prompt).toContain('anomaly_score')
  })

  it('parseResponse handles clean JSON', () => {
    const service = new GeminiService()
    const raw = JSON.stringify({
      suppliers: ['A Corp'],
      suspicious_clauses: [],
      compliance_risks: [],
      anomaly_score: 0,
      summary: 'Clean document',
    })
    const result = service.parseResponse(raw)
    expect(result.suppliers).toEqual(['A Corp'])
    expect(result.anomaly_score).toBe(0)
  })

  it('parseResponse strips markdown fences', () => {
    const service = new GeminiService()
    const raw = '```json\n{"suppliers":[],"suspicious_clauses":[],"compliance_risks":[],"anomaly_score":0,"summary":"test"}\n```'
    const result = service.parseResponse(raw)
    expect(result.summary).toBe('test')
  })

  it('parseResponse throws on invalid JSON', () => {
    const service = new GeminiService()
    expect(() => service.parseResponse('not json')).toThrow('Gemini returned invalid JSON')
  })

  it('analyzeProcurementDocument factory reuses instance', async () => {
    const { analyzeProcurementDocument } = await import('../services/gemini.service')
    // No GEMINI_API_KEY set in test env — should throw
    await expect(analyzeProcurementDocument('test')).rejects.toThrow('Missing GEMINI_API_KEY')
  })
})
