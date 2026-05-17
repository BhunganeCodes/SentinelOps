import { Router } from 'express'
import { analyzeProcurementDocument } from '../services/gemini.service'

const router = Router()

router.post('/analyze-document', async (req, res) => {
  try {
    const { documentText } = req.body

    if (!documentText || typeof documentText !== 'string') {
      return res.status(400).json({
        error: 'documentText is required and must be a string'
      })
    }

    const analysis = await analyzeProcurementDocument(documentText)

    res.json({
      success: true,
      data: analysis
    })
  } catch (error) {
    console.error('AI analysis failed:', error)

    res.status(500).json({
      success: false,
      error: 'Failed to analyze document'
    })
  }
})

export default router