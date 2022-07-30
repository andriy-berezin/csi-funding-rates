import { useState, useEffect } from 'react'
import { createStyles, Title, Button, Container, Group, Space, Table, ScrollArea, MultiSelect, Checkbox, Tabs } from '@mantine/core';
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
  const topCoins = ['BTC-PERP', 'ETH-PERP', 'USDT-PERP', 'USDC-PERP', 'BNB-PERP', 'BUSD-PERP', 'XRP-PERP', 'ADA-PERP', 'SOL-PERP', 'DOGE-PERP', 'DOT-PERP', 'MATIC-PERP', 'DAI-PERP', 'AVAX-PERP', 'UNI-PERP', 'SHIB-PERP', 'TRX-PERP', 'WBTC-PERP', 'ETC-PERP', 'LEO-PERP', 'LTC-PERP', 'FTT-PERP', 'LINK-PERP', 'CRO-PERP', 'NEAR-PERP', 'ATOM-PERP', 'XLM-PERP', 'XMR-PERP', 'BCH-PERP', 'ALGO-PERP', 'APE-PERP', 'VET-PERP', 'FLOW-PERP', 'MANA-PERP', 'ICP-PERP', 'SAND-PERP', 'XTZ-PERP', 'HBAR-PERP', 'AXS-PERP', 'FIL-PERP', 'THETA-PERP', 'AAVE-PERP', 'QNT-PERP', 'EOS-PERP', 'EGLD-PERP', 'BSV-PERP', 'TUSD-PERP', 'HNT-PERP', 'MKR-PERP', 'OKB-PERP', 'KCS-PERP', 'ZEC-PERP', 'USDP-PERP', 'BTT-PERP', 'KLAY-PERP', 'RUNE-PERP', 'GRT-PERP', 'MIOTA-PERP', 'XEC-PERP', 'FTM-PERP', 'NEO-PERP', 'CHZ-PERP', 'LDO-PERP', 'CRV-PERP', 'USDN-PERP', 'USDD-PERP', 'HT-PERP', 'WAVES-PERP', 'BAT-PERP', 'PAXG-PERP', 'CAKE-PERP', 'BTG-PERP', 'GMT-PERP', 'STX-PERP', 'LRC-PERP', 'ZIL-PERP', 'DASH-PERP', 'ENJ-PERP', 'KSM-PERP', 'CVX-PERP', 'QTUM-PERP', 'MINA-PERP', 'SNX-PERP', 'XEM-PERP', 'AR-PERP', 'KAVA-PERP', 'CELO-PERP', '1INCH-PERP', 'GNO-PERP', 'FEI-PERP', 'COMP-PERP', 'TWT-PERP', 'RVN-PERP', 'ROSE-PERP', 'NEXO-PERP', 'DCR-PERP', 'GALA-PERP', 'HOT-PERP', 'OP-PERP', 'AMP-PERP']
  
  const { classes } = useStyles(); 

  useEffect(() => {
    getFundingRates();
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

  const showRows = (rates, top = false) => rates.map((element) => (
    <tr key={element.future}>
      <td> <Checkbox/></td>
      <td>{element.future}</td>
      <td 
       className={ top ? element.rate>0 ? classes.redText : classes.greenText : ''}
      >{element.rate}</td>
      <td><a href={"https://www.tradingview.com/chart?symbol="+ element.future.replace('-','')} 
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
            })}>CSI Funding Rates (FTX)</Title>
        <Button onClick={()=>getFundingRates()}>Reload</Button>
      </Group>
      <Space h="md" />
      <Tabs>
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
