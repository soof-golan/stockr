import {useSocketController} from "../SocketController";
import React, {useEffect, useState} from "react";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {TradeRow} from "./TradeRow";
import {TradeFooterRow} from "./TradeFooterRow";
import {SubscriptionMessage} from "../types";
import TableFooter from "@mui/material/TableFooter";

export function TradeTable() {
  const socketController = useSocketController();
  const [tickers, setTickers] = useState<Array<string>>([]);
  const [connected, setConnected] = useState(socketController.connected());

  function updateTickers(m: SubscriptionMessage) {
    setTickers(m.trades)
  }

  function tradeTableConnectionHandler(status: boolean) {
    setConnected(status);
  }

  useEffect(() => {
    socketController.addConnectionHandler(tradeTableConnectionHandler)
    socketController.addSubscriptionHandler(updateTickers);
  })

  return <TableContainer component={Paper}>
    <Table aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell>Ticker</TableCell>
          <TableCell align="right">Asking Price</TableCell>
          <TableCell align="right">Bid Price</TableCell>
          <TableCell align="right">Timestamp</TableCell>
          <TableCell align="center">Controls</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tickers.map((ticker) => (
          <TradeRow ticker={ticker} connected={connected}/>
        ))}
      </TableBody>
      <TableFooter>
        <TradeFooterRow connected={connected}/>
      </TableFooter>
    </Table>
  </TableContainer>
}