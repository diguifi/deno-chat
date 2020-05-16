import { WebSocket, isWebSocketCloseEvent, isWebSocketPingEvent } from 'https://deno.land/std/ws/mod.ts'
import { v4 } from 'https://deno.land/std/uuid/mod.ts'
  
  const pingEvent = ["ping", Uint8Array]
  const users = new Map<string, WebSocket>()

  function isPingEvent(ev: any): boolean {
    if (ev == pingEvent) return true;
    return false;
  }
  
  function pong(senderId: string): void {
    let user = users.get(senderId)
    user?.send('pong');
  }

  function broadcast(message: string, senderId?: string): void {
    for (const user of users.values()) {
      user.send(senderId ? `[${senderId}]: ${message}` : message)
    }
  }
  
  export async function chat(ws: WebSocket): Promise<void> {
    const userId = v4.generate()
  
    // Register user connection
    users.set(userId, ws)
    broadcast(`> User with the id ${userId} is connected`)
  
    // Wait for new messages
    for await (const event of ws) {
      const message = typeof event === 'string' ? event : ''

      if (!message && isWebSocketCloseEvent(event)) {
        users.delete(userId)
        broadcast(`> User with the id ${userId} is disconnected`)
        break
      }

      if(!isPingEvent(event)) {
        broadcast(message, userId)
      } else {
        pong(userId)
      }
    }
  }