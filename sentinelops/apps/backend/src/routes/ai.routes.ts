import { Router } from 'express'
import { analyzeProcurementDocument } from '../services/gemini.service'
import { supabase } from '../lib/supabase'

const router = Router()

router.post('/analyze-document', async (req, res) => {
  try {
    const { documentText } = req.body

    if (!documentText || typeof documentText !== 'string') {
      return res.status(400).json({
        error: 'documentText is required and must be a string'
      })
    }

    // Analyze document using Gemini
    const analysis = await analyzeProcurementDocument(documentText)

    // Save result to Supabase
    const { error } = await supabase
      .from('procurement_analyses')
      .insert([
        {
          document_text: documentText,
          analysis_json: analysis
        }
      ])

    if (error) {
      console.error('Supabase insert error:', error)
    }

    // Calculate risk level
    const score = analysis.anomaly_score

    const riskLevel =
      score >= 0.8 ? 'HIGH' :
      score >= 0.5 ? 'MEDIUM' :
      'LOW'

    // Return analysis with risk level
    res.json({
      success: true,
      data: {
        ...analysis,
        risk_level: riskLevel
      }
    })
  } catch (error) {
    console.error('AI analysis failed:', error)

    res.status(500).json({
      success: false,
      error: 'Failed to analyze document'
    })
  }
})

router.get('/analyses', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('procurement_analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Failed to fetch analyses:', error)

    res.status(500).json({
      success: false,
      error: 'Failed to fetch analyses'
    })
  }
})

export default router