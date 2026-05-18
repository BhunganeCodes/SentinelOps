import express from 'express'
import cors from 'cors'
import aiRoutes from './routes/ai.routes'
import procurementRoutes from './routes/procurement.routes'

export const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/ai', aiRoutes)
app.use('/api', procurementRoutes)

app.use((error: Error & { statusCode?: number; code?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error)

  const statusCode = error.statusCode ?? (error.code === 'LIMIT_FILE_SIZE' ? 413 : 500)
  const isProduction = process.env.NODE_ENV === 'production'
  const message = isProduction && statusCode >= 500
    ? 'Internal server error'
    : error.message || 'Internal server error'

  res.status(statusCode).json({
    error: message,
    code: error.code,
    statusCode
  })
})
