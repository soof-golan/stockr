import {useEffect, useState} from 'react'
import './App.css'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';
import React from 'react';

type AlpacaMessage = { T: string, msg: string, code?: number };
type TradeMessage = { T: 'q' | 't', S: string, ap: number, bp: number, t: string } & AlpacaMessage;
type SubscriptionMessage = { T: 'subscription', trades: Array<string>, quotes: Array<string> } & AlpacaMessage;
type AlpacaCredentials = { secret: string, keyId: string };
type TradeHandler = (msg: TradeMessage) => void;
type SubscriptionHandler = (msg: SubscriptionMessage) => void;
type ConnectionHandler = (value: boolean) => void;

class SocketController {
  private ws: Partial<WebSocket> = {};
  private credentials?: AlpacaCredentials;
  private promisifyClose = async (ws: Partial<WebSocket>) => new Promise<void>(resolve => {
    const prevHandler = ws.onclose;
    return ws.onclose = (e) => {
      console.log(prevHandler)
      if (typeof prevHandler === 'function') {
        prevHandler(e);
      }
      resolve();
    };
  });
  private static instance: SocketController = undefined;
  static get = () => {
    SocketController.instance = SocketController.instance ?? new SocketController();
    return SocketController.instance
  };

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
  private connectionHandlers: Array<(v: boolean) => any> = []
  private messageHandlers: { [T: string]: Array<TradeHandler | SubscriptionHandler> } = {
    q: [],
    t: [],
    subscription: []
  }

  private handlers: { [eventName: string]: (message: AlpacaMessage) => any } = {
    'authenticated': (message: AlpacaMessage) => {
      console.log('Connected successfully!', message)
      this.connectionHandlers.forEach(f => f(true));
    },
    'connected': ({T}: AlpacaMessage) => (T === 'success') ? this.authenticate() : null,
    "connection limit exceeded": this.handleError,
    "auth timeout": this.handleError,
    "auth failed": this.handleError,
  }

  private onMessage = (event: MessageEvent) => {
    const messages: AlpacaMessage[] = JSON.parse(event.data);
    console.log('Message:', messages)
    messages.filter(message => message?.msg in this.handlers).map((message) => this.handlers[message.msg](message));
    messages.filter(messages => messages.T in this.messageHandlers).map(message => this.messageHandlers[message.T].map(f => f(message)));
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
      console.warn(e)
      this.connectionHandlers.forEach(f => f(false));
    };
  }

  public subscribe = (ticker: string) => this.send({action: "subscribe", trades: [ticker], quotes: [ticker]});
  public unsubscribe = (ticker: string) => this.send({action: "unsubscribe", trades: [ticker], quotes: [ticker]});
  private addHandler = (handler: TradeHandler | SubscriptionHandler, T: string): any => this.messageHandlers[T].push(handler);
  public addTradeHandler = (handler: TradeHandler) => this.addHandler(handler, 't')
  public addQuoteHandler = (handler: TradeHandler) => this.addHandler(handler, 'q');
  public addConnectionHandler = (handler: ConnectionHandler) => this.connectionHandlers.push(handler);
  public addSubscriptionHandler = (handler: SubscriptionHandler) => this.addHandler(handler, 'subscription');
  public connected = () => !this.ws.CLOSED && this.ws.OPEN
}

const useSocketController = () => SocketController.get()

type TradeData = { [ticker: string]: { askingPrice: number, bidPrice: number, timestamp: string } };
const createData = (
  askingPrice: number,
  bidPrice: number,
  timestamp: string,
) => ({askingPrice, bidPrice, timestamp});

function TradeTable() {
  const socketController = useSocketController();
  const [tickers, setTickers] = useState(['']);
  const [data, setData] = useState<TradeData>({});
  socketController.addQuoteHandler(m => {
    const dataWithUpdate = cloneDeep(data);
    set(dataWithUpdate, m.S, createData(m.ap, m.bp, m.t));
    setData(dataWithUpdate);
  });

  useEffect(() => {
    console.log(data)
    setTickers(tickers)
  }, [setData]);
  socketController.addSubscriptionHandler((m: SubscriptionMessage) => {
    setTickers(m.trades)
    m.trades.filter(ticker => !(ticker in data)).forEach(ticker => {
      const dataWithUpdate = cloneDeep(data);
      set(dataWithUpdate, ticker, createData(-1, -1, 'waiting for data'));
      setData(dataWithUpdate);
    });
  });

  return <TableContainer component={Paper}>
    <Table sx={{minWidth: 650}} aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell>Ticker</TableCell>
          <TableCell align="right">Asking Price</TableCell>
          <TableCell align="right">Bid Price</TableCell>
          <TableCell align="right">Timestamp</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tickers.filter(s => s in data).map((ticker) => (
          <TableRow
            key={ticker}
            sx={{'&:last-child td, &:last-child th': {border: 0}}}
          >
            <TableCell component="th" scope="row">
              {ticker}
            </TableCell>
            <TableCell align="right">{data[ticker].askingPrice}</TableCell>
            <TableCell align="right">{data[ticker].bidPrice}</TableCell>
            <TableCell align="right">{data[ticker].timestamp}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
}

function TraceControl({gridXs}: {gridXs: number}) {
  const socketController = useSocketController();
  const [ticker, setTicker] = useState('');
  const updateTicker = (value: string) => {
    setTicker((value ?? '').toString().toUpperCase())
  }
  return <Grid container spacing={2} columns={9}>
    <Grid container item spacing={2}>
      <Grid item xs={gridXs}>
        <TextField
          id="ticker"
          label="Ticker"
          type='text'
          fullWidth
          onChange={(event) => updateTicker(event.target.value)}
          value={ticker}
        />
      </Grid>
      <Grid item xs={gridXs}>
        <Button
          variant="contained"
          className='button-stockr'
          fullWidth
          onClick={() => socketController.subscribe(ticker)}>
          Subscribe
        </Button>
      </Grid>
      <Grid item xs={gridXs}>
        <Button
          variant="contained"
          className='button-stockr'
          fullWidth
          onClick={() => socketController.unsubscribe(ticker)}>
          Unsubscribe
        </Button>
      </Grid>
    </Grid>
  </Grid>
}

function App() {
  const storage = window.localStorage;
  const socketController = useSocketController();
  const [secret, setSecret] = useState(storage?.secret ?? '');
  const [keyId, setKeyId] = useState(storage?.keyId ?? '');
  const [connected, setConnectedStatus] = useState(socketController.connected());

  socketController.addConnectionHandler((value) => setConnectedStatus(value));

  const updateSecret = (value: string) => {
    storage.setItem('secret', value);
    setSecret(value);
  }
  const updateKeyId = (value: string) => {
    storage.setItem('keyId', value);
    setKeyId(value);
  }
  const gridXs = 3

  return (
    <div className="App">
      <header className="App-header">
        <h1>stockr</h1>
        <Box>
          <h2 align="left">Connection Control</h2>
          <Grid container spacing={2} columns={9}>
            <Grid container item spacing={2}>
              <Grid item xs={gridXs}>
                <TextField
                  id="alpaca-api-key-secret"
                  label="API Key Secret"
                  type="password"
                  fullWidth
                  autoComplete='alpaca-api-key-secret'
                  onChange={(event) => updateSecret(event.target.value)}
                  value={secret}
                />
              </Grid>
              <Grid item xs={gridXs}>
                <TextField
                  id="alpaca-api-key-id"
                  label="API Key ID"
                  type='text'
                  fullWidth
                  autoComplete='alpaca-api-key-id'
                  onChange={(event) => updateKeyId(event.target.value)}
                  value={keyId}
                />
              </Grid>
              <Grid item xs={gridXs}>
                <Button
                  className='button-stockr'
                  variant="contained"
                  fullWidth
                  onClick={() => socketController.connect({keyId, secret})}>
                  {connected ? 'Connected ⚡' : 'Press to Connect 🚀'}
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <h2 align="left">Trade Controls</h2>
          <TraceControl gridXs={gridXs}/>
          <h2 align="left">Trading Data</h2>
          <TradeTable/>
        </Box>
      </header>
    </div>
  )
}

export default App
