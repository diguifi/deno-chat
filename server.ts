import { listenAndServe } from 'https://deno.land/std/http/server.ts'
import { acceptWebSocket, acceptable } from 'https://deno.land/std/ws/mod.ts'
import * as flags from "https://deno.land/std@v0.50.0/flags/mod.ts";
import { chat } from './chat.ts'

const DEFAULT_PORT = 3000;
const argPort = flags.parse(Deno.args).port;
const port = argPort ? Number(argPort) : DEFAULT_PORT;

listenAndServe({ port: port }, async (req) => {
  if (req.method === 'GET' && req.url === '/') {
    req.respond({
      status: 200,
      headers: new Headers({
        'content-type': 'text/html',
      }),
      body: await Deno.open('./index.html'),
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

console.log(`Server running on localhost:${port}`)