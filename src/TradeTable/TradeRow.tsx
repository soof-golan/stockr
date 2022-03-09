import {useSocketController} from "../SocketController";
import React, {useEffect, useState} from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import {TradeMessage} from "../types";

export function TradeRow({ticker}: { ticker: string, connected: boolean }) {
  const createData = (
    askingPrice: number,
    bidPrice: number,
    timestamp: string,
  ) => ({askingPrice, bidPrice, timestamp});

  const socketController = useSocketController();
  const [data, setData] = useState(createData(0, 0, 'waiting for data'))
  function tradeRowQuoteHandler(m: TradeMessage) {
    setData(createData(m.ap || data.askingPrice, m.bp || data.bidPrice, m.t));

  }
  useEffect(() => {
    socketController.addQuoteHandler(ticker, tradeRowQuoteHandler);
  })
  return <TableRow
    key={ticker}
    sx={{'&:last-child td, &:last-child th': {border: 0}}}
  >
    <TableCell component="th" scope="row">
      {ticker}
    </TableCell>
    <TableCell align="right">{data.askingPrice || <CircularProgress size={20}/>}</TableCell>
    <TableCell align="right">{data.bidPrice || <CircularProgress size={20}/>}</TableCell>
    <TableCell align="right">{data.timestamp}</TableCell>
    <TableCell align="left">
      <Button
        variant='outlined'
        color={'info'}
        fullWidth
        onClick={() => socketController.unsubscribe(ticker)}
      >
        ➖ Unsubscribe
      </Button>
    </TableCell>
  </TableRow>
}