import { describe, expect, it, vi } from 'vitest'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(async () => ({
            data: { id: 'audit-1', created_at: '2026-05-18T12:00:00Z' },
            error: null,
          })),
        })),
      })),
    })),
  },
}))

vi.mock('../services/realtime.service', () => ({
  emitRealtimeEvent: vi.fn(),
}))

import { recordAuditLog } from '../services/audit.service'

describe('Audit Log Emission', () => {
  it('inserts an audit row and emits an audit_event', async () => {
    const { emitRealtimeEvent } = await import('../services/realtime.service')

    await recordAuditLog({
      event_type: 'analysis_complete',
      severity: 'low',
      message: 'Document analysis completed successfully',
      document_id: 'doc-1',
    })

    expect(emitRealtimeEvent).toHaveBeenCalledWith('audit_event', expect.objectContaining({
      event_type: 'analysis_complete',
      message: 'Document analysis completed successfully',
    }))
  })

  it('inserts a critical audit entry without document_id', async () => {
    const { emitRealtimeEvent } = await import('../services/realtime.service')
    vi.mocked(emitRealtimeEvent).mockClear()

    await recordAuditLog({
      event_type: 'system_error',
      severity: 'critical',
      message: 'System encountered an unexpected error',
    })

    expect(emitRealtimeEvent).toHaveBeenCalledWith('audit_event', expect.objectContaining({
      event_type: 'system_error',
      severity: 'critical',
    }))
  })
})
