import type { AddressInfo } from 'net'
import type { Express } from 'express'
import type { Server } from 'http'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const insertMock = vi.fn()
const triggerDocumentAnalysisMock = vi.fn()

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: insertMock
    }))
  }
}))

vi.mock('../services/analysis.service', () => ({
  triggerDocumentAnalysis: triggerDocumentAnalysisMock
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

describe('TEST-3.3 POST /api/upload', () => {
  beforeEach(() => {
    insertMock.mockReset()
    triggerDocumentAnalysisMock.mockReset()

    insertMock.mockReturnValue({
      select: vi.fn(() => ({
        single: vi.fn(async () => ({
          data: {
            id: 'document-123',
            status: 'processing'
          },
          error: null
        }))
      }))
    })
  })

  it('returns 200 and a document_id for a sample PDF', async () => {
    const { app } = await import('../app')
    const { server, url } = await startTestServer(app)
    const formData = new FormData()

    formData.set(
      'file',
      new Blob(['%PDF-1.4\n%sample procurement document\n'], {
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
    expect(body).toEqual({
      document_id: 'document-123',
      status: 'processing'
    })
  })

  it('creates a processing document row and starts analysis in the background', async () => {
    const { app } = await import('../app')
    const { server, url } = await startTestServer(app)
    const formData = new FormData()

    formData.set(
      'file',
      new Blob(['item,quantity\npaper,10\n'], {
        type: 'text/plain'
      }),
      'purchase-order.txt'
    )

    const response = await fetch(`${url}/api/upload`, {
      method: 'POST',
      body: formData
    })

    server.close()

    expect(response.status).toBe(200)
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        original_filename: 'purchase-order.txt',
        mime_type: 'text/plain',
        status: 'processing',
        file_path: expect.stringContaining('/tmp/')
      })
    )
    expect(triggerDocumentAnalysisMock).toHaveBeenCalledWith('document-123')
  })
})
