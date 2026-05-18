import { Router } from 'express'
import { GovernanceEngine } from '../services/governance.engine'
import { supabase } from '../lib/supabase'

const router = Router()
const engine = new GovernanceEngine()

router.post('/inspect-prompt', async (req, res, next) => {
  try {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt : ''
    const declared = typeof req.body?.declared_intent === 'string' ? req.body.declared_intent : undefined
    const detected = typeof req.body?.detected_intent === 'string' ? req.body.detected_intent : undefined

    const verdict = engine.evaluate(prompt, { declared_intent: declared, detected_intent: detected })

    const { data, error } = await supabase
      .from('governance_events')
      .insert({
        prompt_snippet: prompt.slice(0, 500),
        action: verdict.action,
        policy_triggered: verdict.policy_triggered ?? null,
        risk_delta: verdict.risk_delta,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to persist governance event:', error.message)
    }

    const statusCode = verdict.action === 'block' ? 403 : 200
    res.status(statusCode).json({
      status: verdict.action,
      policy_triggered: verdict.policy_triggered ?? null,
      risk_delta: verdict.risk_delta,
      event_id: data?.id ?? null,
    })
  } catch (error) {
    next(error)
  }
})

router.post('/policy-check', async (req, res, next) => {
  try {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt : ''
    const declared = typeof req.body?.declared_intent === 'string' ? req.body.declared_intent : undefined
    const detected = typeof req.body?.detected_intent === 'string' ? req.body.detected_intent : undefined

    const verdict = engine.evaluate(prompt, { declared_intent: declared, detected_intent: detected })

    const violations: string[] = []
    if (verdict.policy_triggered) {
      violations.push(verdict.policy_triggered)
    }

    res.status(200).json({
      allowed: verdict.action !== 'block',
      action: verdict.action,
      violations,
      risk_delta: verdict.risk_delta,
      total_risk_score: engine.getScore(),
    })
  } catch (error) {
    next(error)
  }
})

router.get('/risk-events', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 50)
    const offset = Number(req.query.offset ?? 0)

    const { data, error, count } = await supabase
      .from('governance_events')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + Math.max(1, limit) - 1)

    if (error) {
      throw new Error(`Failed to load risk events: ${error.message}`)
    }

    res.status(200).json({
      events: data ?? [],
      total: count ?? 0,
      page: Math.floor(offset / Math.max(1, limit)) + 1,
    })
  } catch (error) {
    next(error)
  }
})

export default router
