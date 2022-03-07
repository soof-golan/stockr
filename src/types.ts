export type AlpacaMessage = { T: string, msg: string, code?: number };
type TradeMessage = { T: 'q' | 't', S: string, ap: number, bp: number, t: string } & AlpacaMessage;
export type SubscriptionMessage = { T: 'subscription', trades: Array<string>, quotes: Array<string> } & AlpacaMessage;
export type AlpacaCredentials = { secret: string, keyId: string };
export type TradeHandler = (msg: TradeMessage) => void;
export type SubscriptionHandler = (msg: SubscriptionMessage) => void;
export type ConnectionHandler = (value: boolean) => void;
export type TradeData = { [ticker: string]: { askingPrice: number, bidPrice: number, timestamp: string } };