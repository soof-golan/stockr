import React from 'react'
import './App.css'
import Box from '@mui/material/Box';
import {TradeTable} from "./TradeTable";
import {TradeControl} from "./TradeControl";
import {ConnectionControl} from "./ConnectionControl";

function App() {
  const gridXs = 3;
  return (
    <div className="App">
      <header className="App-header">
        <h1>stockr</h1>
        <Box>
          <h2 align="left">Connection Control</h2>
          <ConnectionControl gridXs={gridXs}/>
          <h2 align="left">Trade Controls</h2>
          <TradeControl gridXs={gridXs}/>
          <h2 align="left">Trading Data</h2>
          <TradeTable/>
        </Box>
      </header>
    </div>
  )
}

export default App
