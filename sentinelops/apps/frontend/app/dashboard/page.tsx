'use client'

import { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket'

export default function DashboardPage() {
  const [lastPing, setLastPing] = useState<string | null>(null)

  useEffect(() => {
    const socket = getSocket()
    socket.on('ping', (data: { timestamp: string }) => {
      console.log('pong', data)
      setLastPing(data.timestamp)
    })
    return () => { socket.off('ping') }
  }, [])

  return (
    <main style={{ padding: '2rem' }}>
      <h1>SentinelOPS Dashboard</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Socket status:{' '}
        {lastPing
          ? `✅ Connected — last ping ${lastPing}`
          : '⏳ Waiting for ping...'}
      </p>
    </main>
  )
}