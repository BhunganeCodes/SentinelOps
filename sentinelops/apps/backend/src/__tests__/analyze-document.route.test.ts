import { describe, expect, it, vi } from 'vitest'
import type { AddressInfo } from 'net'
import type { Express } from 'express'
import type { Server } from 'http'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(async () => ({ error: null })),
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(async () => ({ data: [], error: null })),
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

describe('POST /api/analyze-document', () => {
  it('returns 400 when documentText is missing', async () => {
    const { app } = await import('../app')
    const { server, url } = await startTestServer(app)

    const response = await fetch(`${url}/api/analyze-document`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    })

    server.close()
    expect(response.status).toBe(400)
    const body = await response.json() as Record<string, unknown>
    expect(String(body.error)).toContain('documentText')
  })

  it('returns 400 when documentText is not a string', async () => {
    const { app } = await import('../app')
    const { server, url } = await startTestServer(app)

    const response = await fetch(`${url}/api/analyze-document`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ documentText: 123 }),
    })

    server.close()
    expect(response.status).toBe(400)
  })
})
