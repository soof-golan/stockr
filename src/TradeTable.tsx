import {useSocketController} from "./SocketController";
import React, {useEffect, useState} from "react";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Button from "@mui/material/Button";
const createData = (
  askingPrice: number,
  bidPrice: number,
  timestamp: string,
) => ({askingPrice, bidPrice, timestamp});

function TradeRow({ticker}: {ticker: string}){
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
    <TableCell align="center">
      <Button onClick={() => socketController.unsubscribe(ticker)}>⛔</Button>
    </TableCell>
  </TableRow>
}

export function TradeTable() {
  const socketController = useSocketController();
  const [tickers, setTickers] = useState(['']);

  useEffect(() => {
    socketController.addSubscriptionHandler((m) => {
      setTickers(m.trades)
    });
  })

  return <TableContainer component={Paper}>
    <Table sx={{minWidth: 650}} aria-label="simple table">
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
          <TradeRow ticker={ticker}/>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
}