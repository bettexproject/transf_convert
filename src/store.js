import Vue from 'vue'
import Vuex from 'vuex'
import config from './config.js'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    address: '3P4pKfj9UZHqj6pb18921oSftYuQw35gExR',
    exSrcAsset: 'WETH',
    exDstAsset: 'WAVES',
    exOrderType: 'sell',
    exValue: 1000000,
    exPrice: -1,
    exSum: 0
  },
  mutations: {
    setExState (state, { key, value }) {
      state[key] = value
    },
    setSrcAsset (state, payload) {
      state.exSrcAsset = payload
    },
    setDstAsset (state, payload) {
      state.exDstAsset = payload
    },
    setExValue (state, payload) {
      state.exValue = payload// * Math.pow(10, config.assets[state.exSrcAsset].decimals)
    },
    setExOrderType (state, payload) {
      state.exOrderType = payload
    },
    setExPrice (state, payload) {
      state.exPrice = payload
    },
    setExSum (state, payload) {
      state.exSum = payload
    }
  },
  getters: {
    // ExchangeSrcAssetId: state => config.assets[state.exSrcAsset].assetId,
    ExchangeSrcAsset: state => state.exSrcAsset,
    ExchangeDstAsset: state => state.exDstAsset,
    ExchangeValue: state => state.exValue, // / Math.pow(10, config.assets[state.exSrcAsset].decimals),
    ExchangeSum: state => state.exSum,
    ExchangePrice: state => state.ExchangePrice
  },
  actions: {
    checkBalance ({ state }) {
      return new Promise((resolve, reject) => {
        const url = `${config.matcherURL}/orderbook/${config.assets[state.exSrcAsset].assetId}/${config.assets[state.exDstAsset].assetId}/tradableBalance/${state.address}`
        axios.get(url)
          .then((response) => {
            const balance = response.data[config.assets[state.exSrcAsset].assetId]
            const buf = balance >= (state.exValue * Math.pow(10, config.assets[state.exSrcAsset].decimals))
            resolve(buf)
          }).catch((ex) => {
            reject(new Error('Error'))
          })
      })
    },
    calculateExData ({ state, commit }) {
      return new Promise((resolve) => {
        axios.get(`${config.matcherURL}/orderbook/${config.assets[state.exSrcAsset].assetId}/${config.assets[state.exDstAsset].assetId}`)
          .then((response) => {
            const data = response.data
            let price = 0
            let u = 0
            if (data.pair.priceAsset === config.assets[state.exDstAsset].assetId) {
              const bids = data.bids
              let assetAmount = state.exValue * Math.pow(10, config.assets[state.exSrcAsset].decimals)
              for (var b = 0; b < bids.length; b++) {
                price = bids[b].price
                if (assetAmount <= bids[b].amount) {
                  u += bids[b].price * assetAmount
                  assetAmount = 0
                } else {
                  u += bids[b].amount * bids[b].price
                  assetAmount -= bids[b].amount
                }
                if (assetAmount === 0) {
                  break
                }
              }
              commit('setExPrice', price)
              resolve({ success: true, summary: u / Math.pow(10, config.assets[state.exSrcAsset].decimals + config.assets[state.exDstAsset].decimals) })
            } else {
              const asks = data.asks
              let assetAmount = state.exValue * Math.pow(10, config.assets[state.exDstAsset].decimals + config.assets[state.exSrcAsset].decimals)
              for (var a = 0; a < asks.length; a++) {
                price = asks[a].price
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
              commit('setExPrice', price)
              commit('setExOrderType', 'buy')
              resolve({ success: true, summary: u / Math.pow(10, config.assets[state.exDstAsset].decimals) })
            }
          }).catch((ex) => {
            resolve({ success: false, summary: 0 })
          })
      })
    },
    exchange ({ state }) {
      const time = Date.now()
      const amountAssetId = state.exOrderType === 'sell' ? config.assets[state.exSrcAsset].assetId : config.assets[state.exDstAsset].assetId
      const priceAssetId = state.exOrderType === 'sell' ? config.assets[state.exDstAsset].assetId : config.assets[state.exSrcAsset].assetId
      const decimals = state.exOrderType === 'sell' ? config.assets[state.exDstAsset].decimals : config.assets[state.exSrcAsset].decimals
      const order = {
        type: 1002,
        data: {
          matcherPublicKey: '7kPFrHDiGw1rCm7LPszuECwWYL3dMf6iMifLRDJQZMzy',
          orderType: state.exOrderType,
          expiration: time + 1000000,
          version: 1,
          amount: {
            coins: state.exValue * Math.pow(10, decimals),
            assetId: amountAssetId
          },
          price: {
            coins: state.exPrice,
            assetId: priceAssetId
          },
          matcherFee: {
            tokens: '0.003',
            assetId: 'WAVES'
          }
        }
      }
      if (window.WavesKeeper.publicState()) {
        window.WavesKeeper.signAndPublishOrder(order)
          .then((result) => {
            console.log(result)
          }).catch((ex) => {
            console.log(ex)
          })
      }
    }
  }
})
