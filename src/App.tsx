import {useState} from 'react'
import './App.css'

type AlpacaMessage = { T: string, msg: string, code?: number };
type TradeMessage = AlpacaMessage;
type AlpacaCredentials = { secret: string, keyId: string };
type TradeHandler = (msg: TradeMessage) => null;

class SocketController {
  private ws: Partial<WebSocket> = {};
  private credentials?: AlpacaCredentials;
  private promisifyClose = async (ws: Partial<WebSocket>) => new Promise<void>(resolve => ws.onclose = () => resolve());
  private static instance: SocketController = new SocketController();
  static get = () => SocketController.instance;

  private constructor() {
  };

  send = (obj: {}) => this.ws?.send?.(JSON.stringify(obj));

  handleError = (message: AlpacaMessage) => {
    console.error(message)
    this.close();
  }

  private authenticate = () => {
    // @ts-ignore
    const {keyId, secret} = this.credentials;
    console.log('Authenticating', keyId)
    this.send({action: "auth", key: keyId, secret});
  }

  private tradeHandlers: { [T: string]: Array<(m: AlpacaMessage) => any> } = {
    q: [],
    t: []
  }

  private handlers: { [eventName: string]: (message: AlpacaMessage) => any } = {
    'authenticated': (message: AlpacaMessage) => console.log('Connected successfully!', message),
    'connected': ({T}: AlpacaMessage) => (T === 'success') ? this.authenticate() : null,
    "connection limit exceeded": this.handleError,
    "auth timeout": this.handleError,
    "auth failed": this.handleError,
  }

  private onMessage = (event: MessageEvent) => {
    const messages: AlpacaMessage[] = JSON.parse(event.data);
    console.log('Message:', messages)
    messages.filter(message => message?.msg in this.handlers).map((message) => this.handlers[message.msg](message));
    messages.filter(messages => messages.T in this.tradeHandlers).map(message => this.tradeHandlers[message.T].map(f => f(message)));
  }

  private close = () => {
    if (!this?.ws) return;
    const closed = this.promisifyClose(this.ws);
    this.ws?.close?.();
    closed.then();
    this.ws.onclose = null;
    this.ws.onmessage = null;
    this.ws.onerror = null;
    this.ws.onopen = null;
  }

  public connect = (credentials: AlpacaCredentials) => {
    this.close();
    this.credentials = credentials
    this.ws = new WebSocket('wss://stream.data.alpaca.markets/v2/iex');
    this.ws.onmessage = this.onMessage.bind(this);
  }

  public subscribe = (ticker: string) => this.send({action: "subscribe", trades: [ticker], quotes: [ticker]});
  public unsubscribe = (ticker: string) => this.send({action: "unsubscribe", trades: [ticker], quotes: [ticker]});
  private addHandler = (handler: TradeHandler, T: string): any => this.tradeHandlers[T].push(handler);
  public addTradeHandler = (handler: TradeHandler) => this.addHandler(handler, 't')
  public addQuoteHandler = (handler: TradeHandler) => this.addHandler(handler, 'q');
}

const useSocketController = () => SocketController.get()

function App() {
  const storage = window.localStorage;
  const socketController = useSocketController();
  const [secret, setSecret] = useState(storage?.secret ?? '');
  const [keyId, setKeyId] = useState(storage?.keyId ?? '');
  const [ticker, setTicker] = useState('');
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
