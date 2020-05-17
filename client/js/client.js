import { html, render, useEffect, useState } from 'https://unpkg.com/htm/preact/standalone.module.js'

const pingEvent = ["ping", Uint8Array]
let ws
function pingPong(ws) {
ws.send(pingEvent);

setTimeout(() => {
    pingPong(ws);
}, 10000)
}

function Chat() {
// Messages
const [messages, setMessages] = useState([])
const onReceiveMessage = ({ data }) => { 
    if(data != 'pong') {
        setMessages((m) => [...m, data]) 
        }
    }
const onSendMessage = (e) => {
    const msg = e.target[0].value

    e.preventDefault()
    ws.send(msg)
    e.target[0].value = ''
}

// Websocket connection + events
useEffect(() => {
    if (ws) ws.close()
    ws = new WebSocket(`ws://${window.location.host}/ws`)
    ws.onopen = () => pingPong(ws)
    ws.addEventListener('message', onReceiveMessage)

    return () => {
    ws.removeEventListener('message', onReceiveMessage)
    }
}, [])

return html`
    ${messages.map((message) => html` <div>${message}</div> `)}

    <form onSubmit=${onSendMessage}>
    <input type="text" />
    <button>Send</button>
    </form>
`
}

render(html`<${Chat} />`, document.getElementById('app'))