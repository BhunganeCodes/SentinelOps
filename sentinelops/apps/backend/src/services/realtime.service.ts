import type { Server } from "socket.io";

type RealtimeEventName = "risk_event" | "procurement_event" | "audit_event";

let io: Server | null = null;

export function setRealtimeServer(server: Server): void {
  io = server;
}

export function emitRealtimeEvent<TPayload>(
  eventName: RealtimeEventName,
  payload: TPayload
): void {
  io?.emit(eventName, payload);
}
