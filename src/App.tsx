import {useState} from 'react'
import './App.css'

const newAlpacaSocket = ({keyId = '', secret = ''}) => {
  type AlpacaMessage = { T: string, msg: string, code?: number };

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
    messages.filter(message => message?.msg in handlers).map((message) => {
      return handlers[message.msg](message);
    })
    messages.filter(messages => messages.T in tradeHandlers).map(message => handlers[message.T])
  }

  return ws;
}

class SocketController {
  private ws: Partial<WebSocket> = {};
  private promisifyClose = async (ws: Partial<WebSocket>) => new Promise<void>(resolve => ws.onclose = (e) => resolve());
  private static instance: SocketController = new SocketController();
  static get = () => SocketController.instance;

  send = (obj: {}) => this.ws?.send?.(JSON.stringify(obj));

  private close = async () => {
    const closed = this.promisifyClose(this.ws);
    this?.ws?.close?.();
    closed.then();
    this.ws.onclose = null;
    this.ws.onmessage = null;
    this.ws.onerror = null;
    this.ws.onopen = null;
  }

  connect = ({keyId = '', secret = ''}) => {
    this.close().then();
    this.ws = newAlpacaSocket({keyId, secret});
  }

  subscribe = (ticker: string) => this.send({action: "subscribe", trades: [ticker], quotes: [ticker]});
  unsubscribe = (ticker: string) => this.send({action: "unsubscribe", trades: [ticker], quotes: [ticker]});
  // onTrade = (handler) => this.tradeHandlers.push(handler);
  // onQuote = (handler) => this.quoteHandlers.push(handler);
}

const useSocketController = () => SocketController.get()

function App() {
  const storage = window.localStorage;
  const socketController = useSocketController();
  const [secret, setSecret] = useState(storage?.secret ?? '')
  const [keyId, setKeyId] = useState(storage?.keyId ?? '')
  const [ticker, setTicker] = useState('')
  // useEffect(() => {
  //   socketController.connect({keyId, secret})
  // })
  const updateSecret = (value: string) => {
    storage.setItem('secret', value);
    setSecret(value);
  }
  const updateKeyId = (value: string) => {
    storage.setItem('keyId', value);
    setKeyId(value);
  }
  const updateTicker = (value: string) => {
    setTicker((value ?? '').toString().toUpperCase())
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>stockr</h1>
        <p>
          Secret: <input type="password" onChange={(event) => updateSecret(event.target.value)} value={secret}/>
        </p>
        <p>
          Key ID: <input type="text" onChange={(event) => updateKeyId(event.target.value)} value={keyId}/>
        </p>
        <button type='button' onClick={() => socketController.connect({keyId, secret})}> Connect!</button>
        <p>
          Subscribe: <input type="text" onChange={(event) => updateTicker(event.target.value)} value={ticker}/>
          <button type='button' onClick={() => socketController.subscribe(ticker)}> Subscribe!</button>
          <button type='button' onClick={() => socketController.unsubscribe(ticker)}> Unsubscribe!</button>
        </p>
      </header>
    </div>
  )
}

export default App
