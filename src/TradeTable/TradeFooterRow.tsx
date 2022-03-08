import {useSocketController} from "../SocketController";
import React, {useState} from "react";
import TableCell from "@mui/material/TableCell";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import TableRow from "@mui/material/TableRow";

export function TradeFooterRow({connected}: { connected: boolean }) {
  const socketController = useSocketController();
  const [ticker, setTicker] = useState('');
  const updateTicker = (value: string) => {
    setTicker((value ?? '').toString().toUpperCase())
  };
  return <TableRow
    key='inputTicker'
    sx={{'&:last-child td, &:last-child th': {border: 0}}}
  >
    <TableCell component="th" scope="row">
      <TextField
        id="ticker"
        label={connected ? "Enter Ticker" : 'Please Connect'}
        type='text'
        disabled={!connected}
        onChange={(event) => {
          event.preventDefault();
          updateTicker(event.target.value);
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            socketController.subscribe(ticker);
          }
        }}
        value={ticker}
      />
    </TableCell>
    <TableCell/>
    <TableCell/>
    <TableCell/>
    <TableCell align="left">
      <Button
        fullWidth
        onClick={() => socketController.subscribe(ticker)}
        variant='outlined'
        disabled={!connected}
      >
        ➕ Subscribe
      </Button>
    </TableCell>
  </TableRow>
}