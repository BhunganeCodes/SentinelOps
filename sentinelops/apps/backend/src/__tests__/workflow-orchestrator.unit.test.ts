import { describe, expect, it, vi } from 'vitest'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(async () => ({ data: { id: 'analysis-1' }, error: null })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(async () => ({
            data: { id: 'doc-1', file_path: '/tmp/test.pdf', mime_type: 'application/pdf', original_filename: 'test.pdf' },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(async () => ({ error: null })),
      })),
    })),
  },
}))

vi.mock('../services/realtime.service', () => ({
  emitRealtimeEvent: vi.fn(),
}))

vi.mock('../services/audit.service', () => ({
  recordAuditLog: vi.fn(async () => undefined),
}))

vi.mock('../services/analysis.service', () => ({
  inspectPrompt: vi.fn(async () => ({ allowed: true, risk_delta: 0 })),
  analyzeDocumentText: vi.fn(async () => [
    { vendor_name: 'Test Vendor', price: 1000, anomaly_score: 30, risk_level: 'low' as const, suspicious_claim: null },
  ]),
}))

vi.mock('../services/document.service', () => ({
  getDocumentForAnalysis: vi.fn(async () => ({
    id: 'doc-1',
    file_path: '/tmp/test.pdf',
    mime_type: 'application/pdf',
    original_filename: 'test.pdf',
  })),
  readDocumentText: vi.fn(async () => 'test document content'),
  updateDocumentStatus: vi.fn(async () => undefined),
}))

import { runWorkflow } from '../services/workflow.orchestrator'

describe('WorkflowOrchestrator', () => {
  it('completes the analysis pipeline when no inspection issues', async () => {
    await expect(runWorkflow('doc-1')).resolves.toBeUndefined()
  })

  it('handles inspection blocks gracefully', async () => {
    const { inspectPrompt } = await import('../services/analysis.service')
    vi.mocked(inspectPrompt).mockResolvedValueOnce({
      allowed: false,
      reason: 'Blocked by governance policy',
      event_id: 'evt-1',
      risk_delta: 50,
    })

    await expect(runWorkflow('doc-2')).resolves.toBeUndefined()
  })

  it('propagates document service failures', async () => {
    const { readDocumentText } = await import('../services/document.service')
    vi.mocked(readDocumentText).mockRejectedValueOnce(new Error('File not found'))

    await expect(runWorkflow('doc-3')).rejects.toThrow('File not found')
  })
})
