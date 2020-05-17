import { listenAndServe } from 'https://deno.land/std/http/server.ts'
import { acceptWebSocket, acceptable } from 'https://deno.land/std/ws/mod.ts'
import * as flags from 'https://deno.land/std@v0.50.0/flags/mod.ts'
import { chat } from './server/chat.ts'

export class Server {
  private argPort: number = flags.parse(Deno.args).port
  private port: number

  constructor(serverConfigs: any) {
    this.port = this.argPort ? Number(this.argPort) : serverConfigs.defaultPort
  }

  public init(): void {
    listenAndServe({ port: this.port }, async (req) => {
      if (req.method === 'GET' && req.url === '/') {
        req.respond({
          status: 200,
          headers: new Headers({
            'content-type': 'text/html',
          }),
          body: await Deno.open('./client/index.html'),
        })
      }
    
      if (req.method === 'GET' && req.url === '/js/client.js') {
        req.respond({
          status: 200,
          headers: new Headers({
            'content-type': 'application/javascript',
          }),
          body: await Deno.open('./client/js/client.js'),
        })
      }
    
      // WebSockets Chat
      if (req.method === 'GET' && req.url === '/ws') {
        if (acceptable(req)) {
          acceptWebSocket({
            conn: req.conn,
            bufReader: req.r,
            bufWriter: req.w,
            headers: req.headers,
          }).then(chat)
        }
      }
    })

    console.log(`Server running on localhost:${this.port}`)
  }
}