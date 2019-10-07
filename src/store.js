import Vue from 'vue'
import Vuex from 'vuex'
import config from './config.js'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    address: '',
    exSrcAsset: 'WETH',
    exDstAsset: 'WAVES',
    exOrderType: 'sell',
    exValue: 0,
    exPrice: -1,
    exSum: 0
  },
  mutations: {
    setSrcAsset (state, payload) {
      state.exSrcAsset = payload
    },
    setDstAsset (state, payload) {
      state.exDstAsset = payload
    },
    setExValue (state, payload) {
      state.exValue = payload
    },
    setExOrderType (state, payload) {
      state.exOrderType = payload
    },
    setExPrice (state, payload) {
      state.exPrice = payload
    },
    setExSum (state, payload) {
      state.exSum = payload
    },
    setAddress: (state, payload) => { state.address = payload }
  },
  getters: {
    ExchangeSrcAsset: state => state.exSrcAsset,
    ExchangeDstAsset: state => state.exDstAsset,
    ExchangeValue: state => state.exValue,
    ExchangeSum: state => state.exSum,
    ExchangePrice: state => state.ExchangePrice,
    Address: state => state.address
  },
  actions: {
    getAssetBalance ({ state }, srcAsset) {
      const asset = srcAsset || state.exSrcAsset
      const assetsArray = ['WAVES', 'WBTC', 'WETH', 'WUSD']
      const assetSecond = assetsArray.find(value => value !== asset)
      return new Promise((resolve, reject) => {
        const url = `${config.matcherURL}/orderbook/${config.assets[asset].assetId}/${config.assets[assetSecond].assetId}/tradableBalance/${state.address}`
        axios.get(url)
          .then((response) => {
            if (response.data && response.data[config.assets[asset].assetId]) {
              const balance = response.data[config.assets[asset].assetId]
              resolve({ success: true, balance: balance })
            } else {
              reject(new Error('Unable to load balance'))
            }
          }).catch((ex) => {
            reject(new Error(ex))
          })
      })
    },
    checkBalance ({ state }) {
      return new Promise((resolve, reject) => {
        const url = `${config.matcherURL}/orderbook/${config.assets[state.exSrcAsset].assetId}/${config.assets[state.exDstAsset].assetId}/tradableBalance/${state.address}`
        axios.get(url)
          .then((response) => {
            if (response.data) {
              const balance = response.data[config.assets[state.exSrcAsset].assetId]
              const buf = balance >= (state.exValue * Math.pow(10, config.assets[state.exSrcAsset].decimals))
              resolve(buf)
            } else {
              reject(new Error())
            }
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
            if (!data.pair) {
              resolve({ success: false, summary: 0 })
            }
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
              commit('setExOrderType', 'sell')
              commit('setExSum', state.exValue)
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
              commit('setExSum', u / Math.pow(10, config.assets[state.exDstAsset].decimals))
              resolve({ success: true, summary: state.exSum })
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
      const order = {
        type: 1002,
        data: {
          matcherPublicKey: '7kPFrHDiGw1rCm7LPszuECwWYL3dMf6iMifLRDJQZMzy',
          orderType: state.exOrderType,
          expiration: time + 1000000,
          version: 1,
          amount: {
            tokens: state.exSum,
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
