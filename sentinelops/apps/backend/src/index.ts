import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

// Smoke test — emit a ping every 5 seconds
setInterval(() => {
  io.emit('ping', { timestamp: new Date().toISOString() })
}, 5000)

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

// Export io so other modules can emit events
export { app, server, io }

const PORT = process.env.PORT || 4000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})