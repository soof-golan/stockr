import React from 'react'
import './App.css'
import Box from '@mui/material/Box';
import {TradeTable} from "./TradeTable";
import {ConnectionControl} from "./ConnectionControl";

function App() {
  const gridXs = 3;
  return (
    <div className="App">
      <header className="App-header">
        <h1>stockr</h1>
        <Box>
          <h2>Connection Control</h2>
          <ConnectionControl gridXs={gridXs}/>
          <h2>Trading Data</h2>
          <TradeTable/>
        </Box>
      </header>
    </div>
  )
}

export default App
