import express from 'express'
import http from 'http'

const app = express()
const server = http.createServer(app)

app.use(express.json())

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

const PORT = process.env.PORT || 4000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export { app, server }
