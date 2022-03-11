import Button from "@mui/material/Button";
import React from "react";
import Grid from "@mui/material/Grid";

export function PromoSection({gridXs}: { gridXs: number }) {

  return <Grid container spacing={2} columns={12}>
    <Grid container item spacing={2}>
      <Grid item xs={gridXs}>
        <Button
          className='button-stockr'
          variant={'outlined'}
          color={'info'}
          fullWidth
          href={'https://github.com/soof-golan/stockr'}
          rel="noopener noreferrer"
          target={"_blank"}>
          View on GitHub ↗
        </Button>
      </Grid>
      <Grid item xs={gridXs}>
        <Button
          className='button-stockr'
          variant={'outlined'}
          color={'info'}
          fullWidth
          href={'https://blog.soofgolan.com/post/stockr'}
          rel="noopener noreferrer"
          target={"_blank"}>
          Read the Post ↗
        </Button>
      </Grid>
      <Grid item xs={gridXs}>
      </Grid>
      <Grid item xs={gridXs}>
        <h6>© 2022 Soof Golan</h6>
      </Grid>
    </Grid>
  </Grid>
}