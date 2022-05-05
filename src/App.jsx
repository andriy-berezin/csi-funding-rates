import { useState, useEffect } from 'react'
import { Title, Button, Container, Group, Space, Table, ScrollArea, MultiSelect, Checkbox } from '@mantine/core';
import './App.css'

function App() {
  const [fundingRates, setFundingRates] = useState({});
  const [nonTradableCoins, setNonTradableCoins] = useState();
  const [selectedNonTradableCoins, setSelectedNonTradableCoins] = useState(
    (localStorage.getItem('coins') && JSON.parse(localStorage.getItem('coins')))  || []
  );

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
    
    setFundingRates({longRates, shortRates});
  };

  const showRows = (rates) => rates.map((element) => (
    <tr key={element.future}>
      <td> <Checkbox/></td>
      <td>{element.future}</td>
      <td>{element.rate}</td>
    </tr>
  ));

  const addNonTradabelCoins = (coins) => {
    localStorage.setItem('coins', JSON.stringify(coins));
     //remove non tradable selected coins
     const longRates = fundingRates.longRates.filter(i=> !coins.includes(i.future))
     const shortRates = fundingRates.shortRates.filter(i=> !coins.includes(i.future))
     setFundingRates({
      longRates,
      shortRates});
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
            {fundingRates.longRates && 
            ( <Table striped highlightOnHover>
                <thead>
                  <tr>
                    <th></th>
                    <th>Future</th>
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>{showRows(fundingRates.longRates)}</tbody>
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
            {fundingRates.shortRates && 
            (<Table striped highlightOnHover>
                <thead>
                  <tr>
                    <th></th>
                    <th>Future</th>
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>{showRows(fundingRates.shortRates)}</tbody>
              </Table>)}
            </ScrollArea>
          </Container>
      </Group>
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
