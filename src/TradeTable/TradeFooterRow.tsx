import {useSocketController} from "../SocketController";
import React, {useState} from "react";
import TableFooter from "@mui/material/TableFooter";
import TableCell from "@mui/material/TableCell";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

export function TradeFooterRow() {
  const socketController = useSocketController();

  const [ticker, setTicker] = useState('');
  const updateTicker = (value: string) => {
    setTicker((value ?? '').toString().toUpperCase())
  };
  return <TableFooter
    key='inputTicker'
    sx={{'&:last-child td, &:last-child th': {border: 0}}}
  >
    <TableCell component="th" scope="row">
      <TextField
        id="ticker"
        label="Enter Ticker"
        type='text'
        onChange={(event) => {
          updateTicker(event.target.value);
        }}
        value={ticker}
      />
    </TableCell>
    <TableCell/>
    <TableCell/>
    <TableCell/>
    <TableCell align="left">
      <Button onClick={() => socketController.subscribe(ticker)}>➕ Subscribe</Button>
    </TableCell>
  </TableFooter>
}