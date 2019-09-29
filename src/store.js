import Vue from 'vue'
import Vuex from 'vuex'
import Api from './api.js'
import config from './config.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    exSrcAsset: 'WETH',
    exDstAsset: 'WAVES',
    exOrderType: 'sell',
    exValue: 1000000,
    exPrice: 100,
    exSum: 0
  },
  mutations: {
    setExState (state, { key, value }) {
      state[key] = value
    }
  },
  getters: {
    // ExchangeSrcAssetId: state => state.exSrcAssetId,
    // ExchangeDstAssetId: state => state.exDstAssetId,
    ExchangeValue: state => state.exValue,
    ExchangeSum: state => state.exSum,
    ExchangePrice: state => state.ExchangePrice
  },
  actions: {
    async calculateExchangeData ({ state, commit, dispatch }) {
      const data = await Api.calculateExchangeData(config.assets[state.exSrcAsset].assetId, config.assets[state.exDstAsset].assetId, state.exValue)
      console.log(data)
      commit('setExState', { key: 'exValue', value: data.exValue })
      commit('setExState', { key: 'exPrice', value: data.exPrice })
      commit('setExState', { key: 'exSum', value: data.exSum })
      commit('setExState', { key: 'exOrderType', value: data.orderType })
      console.log(window.WavesKeeper.publicState())
      dispatch('exchange')
    },
    async exchange ({ state }) {
      const time = Date.now()
      console.log(time)
      state.exPrice = state.exPrice * 2
      const order = {
        type: 1002,
        data: {
          matcherPublicKey: '7kPFrHDiGw1rCm7LPszuECwWYL3dMf6iMifLRDJQZMzy',
          orderType: state.exOrderType,
          expiration: time + 1000000,
          version: 1,
          amount: {
            coins: state.exValue,
            assetId: state.exOrderType === 'sell' ? config.assets[state.exSrcAsset].assetId : config.assets[state.exDstAsset].assetId
          },
          price: {
            coins: state.exPrice,
            assetId: state.exOrderType === 'sell' ? config.assets[state.exDstAsset].assetId : config.assets[state.exSrcAsset].assetId
          },
          matcherFee: {
            tokens: '0.003',
            assetId: 'WAVES'
          }
        }
      }
      if (window.WavesKeeper.publicState()) {
        const response = await window.WavesKeeper.signAndPublishOrder(order)
        console.log(response)
      }
    }
  }
})
