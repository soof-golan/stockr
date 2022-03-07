import {useSocketController} from "./SocketController";
import React, {useState} from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

export function ConnectionControl({gridXs}: { gridXs: number }) {
  const storage = window.localStorage;
  const socketController = useSocketController();
  const [secret, setSecret] = useState(storage?.secret ?? '');
  const [keyId, setKeyId] = useState(storage?.keyId ?? '');
  // @ts-ignore
  const [connected, setConnectedStatus] = useState<boolean>(socketController.connected());

  socketController.addConnectionHandler((value) => setConnectedStatus(value));

  const updateSecret = (value: string) => {
    storage.setItem('secret', value);
    setSecret(value);
  }
  const updateKeyId = (value: string) => {
    storage.setItem('keyId', value);
    setKeyId(value);
  }
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
          onClick={() => socketController.connect({keyId, secret})}>
          {connected ? 'Connected ⚡' : 'Press to Connect 🚀'}
        </Button>
      </Grid>
    </Grid>
  </Grid>
}