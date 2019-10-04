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
    checkBalance ({ state }) {
      return new Promise((resolve, reject) => {
        const url = `${config.matcherURL}/orderbook/${config.assets[state.exSrcAsset].assetId}/${config.assets[state.exDstAsset].assetId}/tradableBalance/${state.address}`
        axios.get(url)
          .then((response) => {
            console.log(response)
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
    },
    deposit ({ state }) {
      return new Promise((resolve) => {
        if (state.exSrcAsset === 'WBTC') {
          axios.get(`${config.coinomatGatewayURL}/create_tunnel.php?currency_from=BTC&currency_to=WBTC&wallet_to=${state.address}`)
            .then((response) => {
              axios.get(`${config.coinomatGatewayURL}/get_tunnel.php?xt_id=${response.data.tunnel_id}&k1=${response.data.k1}&k2=${response.data.k2}&history=0&lang=ru_RU`)
                .then((response) => {
                  resolve({ success: true, message: response.data.tunnel.wallet_from })
                }).catch((ex) => {
                  console.log(ex)
                  resolve({ success: false, message: 'something went wrong' })
                })
            }).catch((ex) => {
              console.log(ex)
              resolve({ success: false, message: 'something went wrong' })
            })
        } else {
          const buf = {
            assetId: config.assets[state.exSrcAsset].assetId,
            userAddress: state.address
          }
          axios.post(`${config.wavesGatewayURL}/deposit`, buf)
            .then((response) => {
              resolve({ success: true, message: response.data.address })
            }).catch((ex) => {
              console.log(ex)
              resolve({ success: false, message: 'something went wrong' })
            })
        }
      })
    },
    withdraw ({ state }, toAddress) {
      let transfer = {
        type: 4,
        data: {
          amount: {
            tokens: state.exValue,
            assetId: config.assets[state.exSrcAsset].assetId
          },
          fee: {
            tokens: '0.001',
            assetId: 'WAVES'
          }
        }
      }
      return new Promise((resolve) => {
        if (state.exSrcAsset === 'WBTC') {
          axios.get(`${config.coinomatGatewayURL}/create_tunnel.php?currency_from=WBTC&currency_to=BTC&wallet_to=${toAddress}`)
            .then((response) => {
              axios.get(`${config.coinomatGatewayURL}/get_tunnel.php?xt_id=${response.data.tunnel_id}&k1=${response.data.k1}&k2=${response.data.k2}&history=0&lang=ru_RU`)
                .then((response) => {
                  transfer.data.recipient = response.data.tunnel.wallet_from
                  transfer.data.attachment = response.data.tunnel.attachment
                  resolve({ success: true, tx: transfer })
                }).catch((ex) => {
                  console.log(ex)
                  resolve({ success: false, message: 'something went wrong' })
                })
            }).catch((ex) => {
              console.log(ex)
              resolve({ success: false, message: 'something went wrong' })
            })
        } else {
          const buf = {
            assetId: config.assets[state.exSrcAsset].assetId,
            userAddress: toAddress
          }
          axios.post(`${config.wavesGatewayURL}/withdraw`, buf)
            .then((response) => {
              transfer.data.recipient = response.data.recipientAddress
              transfer.data.attachment = response.data.processId
              resolve({ success: true, tx: transfer })
            }).catch((ex) => {
              console.log(ex)
              resolve({ success: false, message: 'something went wrong' })
            })
        }
      })
    }
  }
})
