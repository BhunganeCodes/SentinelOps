import type { AddressInfo } from 'net'
import type { Express } from 'express'
import type { Server } from 'http'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const insertMock = vi.fn()

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: insertMock
    }))
  }
}))

vi.mock('../services/analysis.service', () => ({
  triggerDocumentAnalysis: vi.fn()
}))

async function startTestServer(app: Express): Promise<{ server: Server; url: string }> {
  const server = app.listen(0, '127.0.0.1')

  await new Promise<void>((resolve) => {
    server.once('listening', resolve)
  })

  const address = server.address() as AddressInfo
  return {
    server,
    url: `http://127.0.0.1:${address.port}`
  }
}

describe('POST /api/upload', () => {
  beforeEach(() => {
    insertMock.mockReset()
    insertMock.mockReturnValue({
      select: vi.fn(() => ({
        single: vi.fn(async () => ({
          data: {
            id: 'document-456',
            status: 'processing'
          },
          error: null
        }))
      }))
    })
  })

  it('returns 200 for the implemented upload route instead of 404', async () => {
    const { app } = await import('../app')
    const { server, url } = await startTestServer(app)
    const formData = new FormData()

    formData.set(
      'file',
      new Blob(['%PDF-1.4\n%stub\n'], {
        type: 'application/pdf'
      }),
      'sample.pdf'
    )

    const response = await fetch(`${url}/api/upload`, {
      method: 'POST',
      body: formData
    })
    const body = await response.json()

    server.close()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      document_id: 'document-456',
      status: 'processing'
    })
  })
})
