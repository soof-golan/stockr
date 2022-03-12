import React from 'react'
import './App.css'
import Box from '@mui/material/Box';
import {TradeTable} from "./TradeTable";
import {ConnectionControl} from "./ConnectionControl";
import {PromoSection} from "./PromoSection";
import DocumentMeta from 'react-document-meta';


function App() {
  const gridXs = 3;

  const meta = {
    title: "stockr",
    description: "Real-time trade monitor",
    canonical: "https://stockr.soofgolan.com",
    meta: {
      charset: 'utf-8',
      keywords: 'stock,trade,monitor,websockt,websockts,realtime'
    },
  }
  return (
    <div className="App">
      <DocumentMeta {...meta} />
      <header className="App-header">
        <h1>stockr</h1>
        <Box>
          <h2>Connection Control</h2>
          <ConnectionControl gridXs={gridXs}/>
          <h2>Trading Data</h2>
          <TradeTable/>
          <h4>External Links</h4>
          <PromoSection gridXs={gridXs}/>
        </Box>
      </header>
    </div>
  )
}

export default App
