import { useState, useEffect } from 'react'
import { createStyles, Title, Text, Button, Container, Group, Space, Table, ScrollArea, MultiSelect, Checkbox, Tabs } from '@mantine/core';
import './App.css'

const useStyles = createStyles((theme) => ({
  redText: {
    color: theme.colors.red[7]
  },
  greenText: {
    color: theme.colors.green[7]
  }
}));

function App() {
  const [fundingRates, setFundingRates] = useState([]);
  const [longRates, setLongRates] = useState();
  const [shortRates, setShortRates] = useState();
  const [topRates, setTopRates] = useState();
  const [nonTradableCoins, setNonTradableCoins] = useState();
  const [selectedNonTradableCoins, setSelectedNonTradableCoins] = useState(
    (localStorage.getItem('coins') && JSON.parse(localStorage.getItem('coins')))  || []
  );

  // data.data.cryptoCurrencyList.map(c=>c.symbol+"-PERP")
  const topCoins = ['BTC-PERP', 'ETH-PERP', 'USDT-PERP', 'USDC-PERP', 'BNB-PERP', 'BUSD-PERP', 'XRP-PERP', 'ADA-PERP', 'SOL-PERP', 'DOGE-PERP', 'DOT-PERP', 'DAI-PERP', 'MATIC-PERP', 'SHIB-PERP', 'TRX-PERP', 'AVAX-PERP', 'WBTC-PERP', 'LEO-PERP', 'UNI-PERP', 'ETC-PERP', 'LTC-PERP', 'FTT-PERP', 'LINK-PERP', 'ATOM-PERP', 'CRO-PERP', 'NEAR-PERP', 'XLM-PERP', 'XMR-PERP', 'BCH-PERP', 'ALGO-PERP', 'FLOW-PERP', 'VET-PERP', 'ICP-PERP', 'FIL-PERP', 'EOS-PERP', 'APE-PERP', 'MANA-PERP', 'SAND-PERP', 'HBAR-PERP', 'XTZ-PERP', 'CHZ-PERP', 'EGLD-PERP', 'QNT-PERP', 'AXS-PERP', 'AAVE-PERP', 'THETA-PERP', 'TUSD-PERP', 'BSV-PERP', 'OKB-PERP', 'USDP-PERP', 'ZEC-PERP', 'KCS-PERP', 'BTT-PERP', 'MIOTA-PERP', 'HT-PERP', 'MKR-PERP', 'HNT-PERP', 'USDD-PERP', 'KLAY-PERP', 'GRT-PERP', 'XEC-PERP', 'FTM-PERP', 'USDN-PERP', 'SNX-PERP', 'RUNE-PERP', 'NEO-PERP', 'PAXG-PERP', 'CRV-PERP', 'CAKE-PERP', 'NEXO-PERP', 'LDO-PERP', 'BAT-PERP', 'WAVES-PERP', 'DASH-PERP', 'ZIL-PERP', 'STX-PERP', 'LRC-PERP', 'ENJ-PERP', 'MINA-PERP', 'FEI-PERP', 'KAVA-PERP', 'GMT-PERP', 'BTG-PERP', 'XEM-PERP', 'DCR-PERP', 'TWT-PERP', 'GNO-PERP', 'KSM-PERP', '1INCH-PERP', 'CELO-PERP', 'AR-PERP', 'HOT-PERP', 'GALA-PERP', 'ANKR-PERP', 'XDC-PERP', 'CVX-PERP', 'GT-PERP', 'COMP-PERP', 'TFUEL-PERP', 'QTUM-PERP']
  
  const { classes } = useStyles(); 

  useEffect(() => {
    getFundingRates();
    getKuCoinSymbols()
  }, []);

  const getFundingRates = () => {
    fetch("https://34krsjgjzk.execute-api.us-east-1.amazonaws.com/")
      .then((res) => {
        return res.json();
      })
      .then(({rates}) => {
        splitFundingRates(rates)
      });
  };

  const getKuCoinSymbols = () => {
    fetch("https://api-futures.kucoin.com/api/v1/contracts/active")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
      }); 
  }

  const splitFundingRates = ({result}) => {
    
    // sort by date
    const sortedByDate = result
    .map(i=>{ return { future: i.future, rate: i.rate, time: new Date(i.time)}})
    .sort((a,b)=> new Date(b.date) - new Date(a.date))
   
    // remove duplicated futures
    const uniqueValues = [];
    sortedByDate.forEach( item => {
      const exists = uniqueValues.find(uv => uv.future == item.future)
      if(!exists){
        uniqueValues.push(item)
      }
    })

    // set non tradable coins
    setNonTradableCoins(uniqueValues.map(i=> { 
      return {value: i.future, label: i.future}
    }))

    //remove non tradable selected coins
    const finalCoins = uniqueValues.filter(i=> !selectedNonTradableCoins.includes(i.future))
      
    const shortRates = finalCoins.filter(i=>i.rate >= 0).sort((a,b) =>b.rate-a.rate)
    const longRates = finalCoins.filter(i=>i.rate < 0).sort((a,b) =>a.rate-b.rate)
    const topRates = finalCoins.filter(i=>topCoins.includes(i.future)).sort((a,b) =>Math.abs(b.rate)-Math.abs(a.rate))
    setFundingRates(finalCoins)
    setLongRates(longRates);
    setShortRates(shortRates);
    setTopRates(topRates)
  };

  const showRows = (rates, top = false) => rates.map((element, index) => (
    <tr key={element.future}>
      <td style={{width:'10px'}}><Text>{index+1}</Text></td>
      <td>
        <Checkbox/>
      </td>
      <td>{element.future}</td>
      <td 
       className={ top ? element.rate>0 ? classes.redText : classes.greenText : ''}
      >{element.rate}</td>
      <td><a href={"https://www.tradingview.com/chart?symbol=FTX:"+ element.future.replace('-','')} 
      target="_blank">Chart</a></td>
    </tr>
  ));

  const addNonTradabelCoins = (coins) => {
    localStorage.setItem('coins', JSON.stringify(coins));
     //remove non tradable selected coins
     setLongRates(fundingRates
      .filter(i=> !coins.includes(i.future))
      .filter(i=>i.rate < 0)
      .sort((a,b) =>a.rate-b.rate))
     setShortRates(fundingRates
     .filter(i=> !coins.includes(i.future))
     .filter(i=>i.rate >= 0)
     .sort((a,b) =>b.rate-a.rate))
     setTopRates(fundingRates
     .filter(i=> !coins.includes(i.future))
     .filter(i=>topCoins.includes(i.future))
     .sort((a,b) =>Math.abs(b.rate)-Math.abs(a.rate)))
     setSelectedNonTradableCoins(coins)
  }

  return (
    <Container size="lg">
      <Group position="apart" mb="sm">
        <Title order={1}  sx={(theme) => ({
            color: theme.colors.gray[7]
            })}>CSI Funding Rates</Title>
      </Group>
      <Space h="md" />
      <Tabs>
        <Tabs.Tab label="Top 100">
        <Container p={0} mr="xl">
              <ScrollArea  sx={(theme) => ({
                border: `1px solid ${theme.colors.gray[3]}`,
                borderRadius: 5
                })}>
              {topRates && 
              ( <Table striped highlightOnHover>
                  <thead>
                    <tr>
                      <th style={{width:'10px'}}></th>
                      <th></th>
                      <th>Future</th>
                      <th>Rate</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>{showRows(topRates, true)}</tbody>
                </Table>)}
              </ScrollArea>
            </Container>
        </Tabs.Tab>
        <Tabs.Tab label="All Coins">
        <Group spacing="xl" grow align="top">
            <Container p={0} mr="xl">
              <Title order={2} 
              sx={(theme) => ({
              color: theme.colors.green[7]
              })}>Buy (Long)</Title>
              <Space h="md" />
              <ScrollArea style={{ height: 450 }} sx={(theme) => ({
                border: `1px solid ${theme.colors.gray[3]}`,
                borderRadius: 5
                })}>
              {longRates && 
              ( <Table striped highlightOnHover>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Future</th>
                      <th>Rate</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>{showRows(longRates)}</tbody>
                </Table>)}
              </ScrollArea>
            </Container>
            <Container p={0} ml="xl">
            <Title order={2} 
              sx={(theme) => ({
              color: theme.colors.red[7]
              })}>Sell (Short)</Title>
              <Space h="md" />
              <ScrollArea style={{ height: 450 }} sx={(theme) => ({
                border: `1px solid ${theme.colors.gray[3]}`,
                borderRadius: 5
                })}>
            {shortRates && 
              (<Table striped highlightOnHover>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Future</th>
                      <th>Rate</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>{showRows(shortRates)}</tbody>
                </Table>)}
              </ScrollArea>
            </Container>
        </Group>
        </Tabs.Tab>
       
      </Tabs>
      <Space h="xl" />
      {nonTradableCoins && 
          (<MultiSelect
          searchable
          onChange={addNonTradabelCoins}
          data={nonTradableCoins}
          value={selectedNonTradableCoins}
          label="Not Tradable Coins"
          placeholder="Pick the coins"
        />)
      }
    </Container>
  )
}

export default App
