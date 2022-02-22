import {useEffect, useState} from 'react'
import logo from './logo.svg'
import './App.css'

const alpacaSocket = (keyId: string, secret: string) => {
  type AlpacaMessage = { T: string, msg: string };

  const ws = new WebSocket('wss://stream.data.alpaca.markets/v2/iex');
  const send = (o: any) => ws.send(JSON.stringify(o));

  const authenticate = () => {
    console.log('Authenticating', keyId)
    send({action: "auth", key: keyId, secret});
  }
  const handleError = (message: AlpacaMessage) => {
    console.error(message)
    ws.close()
  }
  const handlers: { [eventName: string]: (message: AlpacaMessage) => any } = {
    'authenticated': (message: AlpacaMessage) => console.log('Connected successfully!'),
    'connected': ({T}: AlpacaMessage) => (T === 'success') ? authenticate() : null,
    "connection limit exceeded": handleError,
    "auth timeout": handleError,
    "auth failed": handleError,
  }
  ws.onmessage = (event: MessageEvent) => {
    const messages: AlpacaMessage[] = JSON.parse(event.data);
    console.log('Message:', messages)
    messages.map((message) => {
      console.log(message.msg)
      return handlers[message.msg.toString()](message);
    })
  }
  ws.onclose = (e) => console.log('Closing:', e)
  return ws;
}

function App() {
  const storage = window.localStorage;
  const [secret, setSecret] = useState(storage?.secret ?? '')
  const [keyId, setKeyId] = useState(storage?.keyId ?? '')
  const [ws, setWs]: [WebSocket | null, any] = useState(null);

  useEffect(() => {
    const newSocket = alpacaSocket(keyId, secret);
    setWs(newSocket);
    return () => newSocket.close();
  }, [setWs, setSecret, setKeyId]);

  const updateSecret = (value: string) => {
    storage.setItem('secret', value);
    setSecret(value);
  }
  const updateKeyId = (value: string) => {
    storage.setItem('keyId', value);
    setKeyId(value);
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo"/>
        <p>Hello Vite + React!</p>
        <p>
          Secret: <input type="password" onChange={(event) => updateSecret(event.target.value)} value={secret}/>
        </p>
        <p>
          Key ID: <input type="text" onChange={(event) => updateKeyId(event.target.value)} value={keyId}/>
        </p>
        <p>
          <button type='button' onClick={() => setWs(alpacaSocket(keyId, secret))}>
            Connect!
          </button>
        </p>
      </header>
    </div>
  )
}

export default App
