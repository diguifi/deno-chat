import { WebSocket, isWebSocketCloseEvent, isWebSocketPingEvent } from 'https://deno.land/std/ws/mod.ts'
import { v4 } from 'https://deno.land/std/uuid/mod.ts'
  
export class Chat {
  private pingEvent = ["ping", Uint8Array]
  private users: Map<string, WebSocket>
  constructor() {
    this.users = new Map<string, WebSocket>()
  }

  private isPingEvent(ev: any): boolean {
    if (ev == this.pingEvent) return true;
    return false;
  }
  
  private pong(senderId: string): void {
    let user = this.users.get(senderId)
    user?.send('pong');
  }

  private broadcast(message: string, senderId?: string): void {
    for (const user of this.users.values()) {
      user.send(senderId ? `[${senderId}]: ${message}` : message)
    }
  }
  
  public async handleClient(ws: WebSocket): Promise<void> {
    const userId = v4.generate()
  
    // Register user connection
    this.users.set(userId, ws)
    this.broadcast(`> User with the id ${userId} is connected`)
  
    // Wait for new messages
    for await (const event of ws) {
      const message = typeof event === 'string' ? event : ''

      if (!message && isWebSocketCloseEvent(event)) {
        this.users.delete(userId)
        this.broadcast(`> User with the id ${userId} is disconnected`)
        break
      }

      if(!this.isPingEvent(event)) {
        this.broadcast(message, userId)
      } else {
        this.pong(userId)
      }
    }
  }
}