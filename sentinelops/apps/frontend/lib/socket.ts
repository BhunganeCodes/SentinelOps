import { io, Socket } from 'socket.io-client'

const URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

let socket: Socket

export function getSocket(): Socket {
  if (!socket) {
    socket = io(URL, {
      transports: ['websocket'],
      autoConnect: true
    })
  }
  return socket
}
