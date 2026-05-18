import { describe, expect, it, vi } from 'vitest'
import type { AddressInfo } from 'net'
import type { Express } from 'express'
import type { Server } from 'http'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: {
                  id: 'analysis-1',
                  document_id: 'doc-1',
                  summary: 'Test analysis',
                  anomaly_score: 30,
                },
                error: null,
              })),
            })),
          })),
        })),
      })),
    })),
  },
}))

async function startTestServer(app: Express): Promise<{ server: Server; url: string }> {
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => { server.once('listening', resolve) })
  const address = server.address() as AddressInfo
  return { server, url: `http://127.0.0.1:${address.port}` }
}

describe('POST /api/generate-report', () => {
  it('returns 200 with a download_url for valid document_id', async () => {
    const { app } = await import('../app')
    const { server, url } = await startTestServer(app)

    const response = await fetch(`${url}/api/generate-report`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ document_id: 'doc-1' }),
    })

    server.close()
    expect(response.status).toBe(200)
    const body = await response.json() as Record<string, unknown>
    expect(body.success).toBe(true)
    expect(String(body.download_url)).toContain('/api/reports/')
  })

  it('returns 400 when document_id is missing', async () => {
    const { app } = await import('../app')
    const { server, url } = await startTestServer(app)

    const response = await fetch(`${url}/api/generate-report`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    })

    server.close()
    expect(response.status).toBe(400)
  })
})
