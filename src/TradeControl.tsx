import {useSocketController} from "./SocketController";
import React, {useState} from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

export function TradeControl({gridXs}: { gridXs: number }) {
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