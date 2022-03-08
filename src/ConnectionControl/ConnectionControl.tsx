import {useSocketController} from "../SocketController";
import React, {useState} from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from '@mui/material/CircularProgress'

export function ConnectionControl({gridXs}: { gridXs: number }) {
  const storage = window.localStorage;
  const socketController = useSocketController();
  const [secret, setSecret] = useState(storage?.secret ?? '');
  const [keyId, setKeyId] = useState(storage?.keyId ?? '');
  // @ts-ignore
  const [connected, setConnectedStatus] = useState<boolean>(socketController.connected());
  // @ts-ignore
  const [connecting, setConnectingStatus] = useState<boolean>(socketController.connecting());

  socketController.addConnectionHandler((value) => {
    setConnectedStatus(value)
    // @ts-ignore
    setConnectingStatus(socketController.connecting());
  });

  const updateSecret = (value: string) => {
    storage.setItem('secret', value);
    setSecret(value);
  }
  const updateKeyId = (value: string) => {
    storage.setItem('keyId', value);
    setKeyId(value);
  }

  const connect = () => {
    setConnectingStatus(true);
    setConnectedStatus(false);
    socketController.connect({keyId, secret});
  };

  return <Grid container spacing={2} columns={9}>
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
          onClick={() => connect()}>
          {connecting ? <CircularProgress size={20}/> :''}
          {connected ? 'Live ⚡' : connecting ? "" : 'Connect'}
        </Button>
      </Grid>
    </Grid>
  </Grid>
}