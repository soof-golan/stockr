import {useSocketController} from "../SocketController";
import React, {useEffect, useState} from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Button from "@mui/material/Button";

export function TradeRow({ticker}: { ticker: string }) {
  const createData = (
    askingPrice: number,
    bidPrice: number,
    timestamp: string,
  ) => ({askingPrice, bidPrice, timestamp});

  const socketController = useSocketController();
  const [data, setData] = useState(createData(-1, -1, 'waiting for data'))
  useEffect(() => {
    socketController.addQuoteHandler(ticker, (m) => {
      setData(createData(m.ap || data.askingPrice, m.bp || data.bidPrice, m.t));
    });
  })
  return <TableRow
    key={ticker}
    sx={{'&:last-child td, &:last-child th': {border: 0}}}
  >
    <TableCell component="th" scope="row">
      {ticker}
    </TableCell>
    <TableCell align="right">{data.askingPrice}</TableCell>
    <TableCell align="right">{data.bidPrice}</TableCell>
    <TableCell align="right">{data.timestamp}</TableCell>
    <TableCell align="left">
      <Button onClick={() => socketController.unsubscribe(ticker)}>➖ Unsubscribe</Button>
    </TableCell>
  </TableRow>
}