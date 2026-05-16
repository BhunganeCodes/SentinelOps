import { Router } from 'express'
import { uploadMiddleware } from '../middleware/upload.middleware'
import { triggerDocumentAnalysis } from '../services/analysis.service'
import { createProcessingDocument } from '../services/document.service'

const router = Router()

router.post('/upload', uploadMiddleware.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'A PDF or TXT file is required' })
      return
    }

    const document = await createProcessingDocument(req.file)

    triggerDocumentAnalysis(document.id)

    res.status(200).json({
      document_id: document.id,
      status: document.status
    })
  } catch (error) {
    next(error)
  }
})

router.post('/analyze-document', async (req, res) => {
  res.status(202).json({
    status: 'accepted',
    document_id: req.body?.document_id
  })
})

export default router
