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

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error)
  res.status(500).json({ error: 'Internal server error' })
})
