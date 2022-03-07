import {useSocketController} from "./SocketController";
import React, {useEffect, useState} from "react";
import {TradeData} from "./types";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";

const createData = (
  askingPrice: number,
  bidPrice: number,
  timestamp: string,
) => ({askingPrice, bidPrice, timestamp});

export function TradeTable() {
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
  socketController.addSubscriptionHandler((m) => {
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