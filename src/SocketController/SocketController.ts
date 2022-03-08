import set from "lodash/set";
import {
  AlpacaCredentials,
  AlpacaMessage,
  ConnectionHandler,
  SubscriptionHandler,
  TradeHandler,
  TradeMessage
} from "../types";

export class SocketController {
  private ws: Partial<WebSocket> = {};
  private credentials?: AlpacaCredentials;
  private promisifyClose = async (ws: Partial<WebSocket>) => new Promise<void>(resolve => {
    const prevHandler = ws.onclose;
    return ws.onclose = (e) => {
      if (typeof prevHandler === 'function') {
        // @ts-ignore
        prevHandler(e);
      }
      resolve();
    };
  });
  private static instance: SocketController | undefined = undefined;
  static get = () => {
    SocketController.instance = SocketController.instance ?? new SocketController();
    return SocketController.instance
  };

  private constructor() {
  };

  send = (obj: {}) => this.ws?.send?.(JSON.stringify(obj));

  handleError = (message: AlpacaMessage) => {
    console.error(message)
    Object.values(this.errorHandlers).forEach(f => f(message))
    this.close();
  }

  private authenticate = () => {
    // @ts-ignore
    const {keyId, secret} = this.credentials;
    console.log('Authenticating', keyId)
    this.send({action: "auth", key: keyId, secret});
  }
  private connectionHandlers: Record<string, (v: boolean) => any> = {}
  private tradeHandlers: { [T: string]: { [ticker: string]: TradeHandler } } = {
    q: {},
    t: {},
  }
  private subscriptionHandlers: Record<string, SubscriptionHandler> = {}
  private errorHandlers: Record<string, (e: AlpacaMessage) => void> = {}
  private handlers: { [eventName: string]: (message: AlpacaMessage) => any } = {
    'authenticated': (message: AlpacaMessage) => {
      console.log('Connected successfully!', message);
      Object.values(this.connectionHandlers).forEach(f => f(true));
    },
    'connected': ({T}: AlpacaMessage) => (T === 'success') ? this.authenticate() : null,
    "connection limit exceeded": this.handleError,
    "auth timeout": this.handleError,
    "auth failed": this.handleError,

  }

  private onMessage = (event: MessageEvent) => {
    const messages: Array<AlpacaMessage & any> = JSON.parse(event.data);
    messages.filter(message => message?.msg in this.handlers).forEach((message) => this.handlers[message.msg](message));
    // @ts-ignore
    messages.filter(messages => messages.T in this.tradeHandlers)
      .forEach(
        (message: TradeMessage) => this.tradeHandlers[message.T]?.[message.S]?.(message)
      );
    messages.filter(m => m.T === 'subscription').forEach(m => Object.values(this.subscriptionHandlers).forEach(f => f(m)))
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
    this.ws.onclose = (e) => {
      console.warn(e);
      Object.values(this.connectionHandlers).forEach(f => f(false));
    };
  }

  public subscribe = (ticker: string) => this.send({action: "subscribe", trades: [ticker], quotes: [ticker]});
  public unsubscribe = (ticker: string) => this.send({action: "unsubscribe", trades: [ticker], quotes: [ticker]});
  private addHandler = (ticker: string, handler: TradeHandler, T: string): any => {
    this.tradeHandlers[T][ticker] = handler;
  };
  public addTradeHandler = (ticker: string, handler: TradeHandler) => this.addHandler(ticker, handler, 't')
  public addQuoteHandler = (ticker: string, handler: TradeHandler) => this.addHandler(ticker, handler, 'q');
  public addConnectionHandler = (handler: ConnectionHandler) => set(this.connectionHandlers, handler.name, handler);
  public addSubscriptionHandler = (handler: SubscriptionHandler) => set(this.subscriptionHandlers, handler.name, handler);
  public addErrorHandler = (handler: (e: AlpacaMessage) => void) => set(this.errorHandlers, handler.name, handler);
  public connected = (): boolean => !!((!this.ws.CLOSED) && (this.ws.OPEN))
  public connecting = (): boolean => !!((!this.connected()) && this.ws.CONNECTING)
}

export const useSocketController = () => SocketController.get()
