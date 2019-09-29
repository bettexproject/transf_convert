import axios from 'axios'
import config from './config.js'

function calculateExchangeDataBySell (bids, amount) {
  let u = 0
  // eslint-disable-next-line no-unused-vars
  let d = 0
  console.log(amount)
  let assetAmount = amount
  let minPrice = 0
  for (var b = 0; b < bids.length; b++) {
    minPrice = bids[b].price
    if (assetAmount <= bids[b].amount) {
      u += bids[b].price * assetAmount
      d += assetAmount
      assetAmount = 0
    } else {
      u += bids[b].amount * bids[b].price
      d += bids[b].amount
      assetAmount -= bids[b].amount
    }
    if (assetAmount === 0) {
      break
    }
  }
  return { error: 0, errorText: 'Success', exSum: u, exPrice: minPrice, exValue: amount - assetAmount, orderType: 'sell' }
}

function calculateExchangeDataByBuy (asks, amount) {
  console.log(asks)
  let u = 0
  // eslint-disable-next-line no-unused-vars
  amount = amount * Math.pow(10, 8)
  let assetAmount = amount
  let maxPrice = 0
  for (var a = 0; a < asks.length; a++) {
    maxPrice = asks[a].price
    console.log(assetAmount)
    console.log(asks[a].price * asks[a].amount)
    console.log(assetAmount <= (asks[a].price * asks[a].amount))
    if (assetAmount <= (asks[a].price * asks[a].amount)) {
      u += Math.trunc(assetAmount / asks[a].price)
      assetAmount = 0
    } else {
      u += asks[a].amount
      assetAmount -= (asks[a].price * asks[a].amount)
    }
    if (assetAmount === 0) {
      break
    }
  }
  return { error: 0, errorText: 'Success', exSum: u, exPrice: maxPrice, exValue: amount - assetAmount, orderType: 'buy' }
}

export default {
  calculateExchangeData: async (amountAsset, priceAsset, amount) => {
    try {
      const response = await axios.get(`${config.matcherURI}/orderbook/${amountAsset}/${priceAsset}`)
      if (response && response.data.pair) {
        if (response.data.pair.priceAsset === 'WAVES') {
          return calculateExchangeDataBySell(response.data.bids, amount)
        } else {
          return calculateExchangeDataByBuy(response.data.asks, amount)
        }
      }
    } catch (ex) {
      console.log(ex)
      return { error: 1, errorText: ex }
    }
  },
  log: async () => {
    console.log('sadasdasd')
  }
}
