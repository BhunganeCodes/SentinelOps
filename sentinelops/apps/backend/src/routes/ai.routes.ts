import { Router } from 'express'
import { analyzeProcurementDocument } from '../services/gemini.service'
import { supabase } from '../lib/supabase'

const router = Router()

router.post('/analyze-document', async (req, res) => {
  try {
    const { documentText } = req.body

    if (!documentText || typeof documentText !== 'string') {
      return res.status(400).json({
        error: 'documentText is required and must be a string',
      })
    }

    const analysis = await analyzeProcurementDocument(documentText)

    const { error } = await supabase
      .from('procurement_analysis')
      .insert([
        {
          document_text: documentText,
          analysis_json: analysis,
        },
      ])

    if (error) {
      console.error('Supabase insert error:', error)
    }

    const score = analysis.anomaly_score
    const riskLevel =
      score >= 0.8 ? 'HIGH' : score >= 0.5 ? 'MEDIUM' : 'LOW'

    res.json({
      success: true,
      data: {
        ...analysis,
        risk_level: riskLevel,
      },
    })
  } catch (error) {
    console.error('AI analysis failed:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to analyze document',
    })
  }
})

router.post('/generate-report', async (req, res) => {
  try {
    const { document_id, format } = req.body

    if (!document_id || typeof document_id !== 'string') {
      return res.status(400).json({
        error: 'document_id is required and must be a string',
      })
    }

    const { data, error } = await supabase
      .from('procurement_analysis')
      .select('*')
      .eq('document_id', document_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return res.status(404).json({
        error: 'No analysis found for the given document_id',
      })
    }

    const reportFormat = format === 'csv' ? 'csv' : 'json'
    const reportId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const downloadUrl = `/api/reports/${reportId}.${reportFormat}`

    res.status(200).json({
      success: true,
      report_id: reportId,
      format: reportFormat,
      download_url: downloadUrl,
      summary: (data as Record<string, unknown>).summary ?? 'Procurement analysis report generated',
    })
  } catch (error) {
    console.error('Report generation failed:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate report',
    })
  }
})

router.get('/analyses', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('procurement_analysis')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Failed to fetch analyses:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analyses',
    })
  }
})

export default router
