import { Router } from 'express'
import { supabase } from '../lib/supabase'

const router = Router()

router.get('/audit-log', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 100)
    const severity = typeof req.query.severity === 'string' ? req.query.severity : undefined

    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.max(1, limit))

    if (severity) {
      query = query.eq('severity', severity)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to load audit log: ${error.message}`)
    }

    res.status(200).json({
      logs: data ?? [],
    })
  } catch (error) {
    next(error)
  }
})

router.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })

  res.write('data: {"type":"connected","message":"SSE stream established"}\n\n')

  const cleanup: (() => void)[] = []

  const unsubscribe = supabase
    .channel('audit_events_stream')
    .on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'audit_logs' },
      (payload: unknown) => {
        res.write(`data: ${JSON.stringify({ type: 'audit_event', payload })}\n\n`)
      },
    )
    .subscribe()

  cleanup.push(() => {
    try {
      supabase.removeChannel(unsubscribe)
    } catch { /* ignore */ }
  })

  const keepAlive = setInterval(() => {
    res.write(':keepalive\n\n')
  }, 15000)
  cleanup.push(() => clearInterval(keepAlive))

  req.on('close', () => {
    for (const fn of cleanup) fn()
  })
})

export default router
