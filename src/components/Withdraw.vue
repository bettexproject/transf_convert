<template>
  <div class="exchange">
    <div class="exchange-title">
      Withdraw
    </div>
    <div class="inline">
      <div class="input-group-place" :class="isAmountValid ? 'valid' : 'invalid'">
        <label for="srcValue">Amount {{withdrawAsset}} </label>
        <input type="text" id="srcValue" v-model="srcValue"/>
      </div>
      <div class="asset-list">
        <input type="radio" id="wWBTC" value="WBTC" v-model="withdrawAsset"><label for="wWBTC">BTC</label>
        <input type="radio" id="wWETH" value="WETH" v-model="withdrawAsset"><label for="wWETH">ETH</label>
      </div>
    </div>
    <div class="inline">
      <div class="input-group-place" :class="isAmountValid ? 'valid' : 'invalid'">
        <label for="amount">Your {{withdrawAsset}} address </label>
        <input type="text" id="amount" v-model="toAddress"/>
      </div>
    </div>
    <div class="inline">
      <div class="green--text">{{wallet}}</div>
    </div>
    <div class="inline">
      <div v-if="error" class="red--text">{{errorText}}</div>
    </div>
    <button @click="buttonClick">Hello</button>
    <!--<button @click="" :disabled="error">exchange</button>-->
  </div>
</template>

<script>
import config from '../config.js'
import axios from 'axios'
  export default {
    name: 'Withdraw',
    data: () => ({
      error: false,
      errorText: '',
      wallet: '',
      toAddress: '',
      isAmountValid: true,
      withdrawAsset: 'WBTC',
      srcValue: 0
    }),
    mounted() {
      // api.calculateChangerSum('4LHHvYGNKJUg5hj65aGD5vgScvCBmLpdRFtjokvCjSL8', 'WAVES')
    },
    methods: {
      buttonClick: function () {
        if (this.toAddress.length === 0){
          this.errorText = 'invalid address'
          this.error = true
          return
        }
        this.checkAndWithdraw()
      },
      checkAndWithdraw: function () {
        this.error = false
        this.$store.dispatch('getAssetBalance', this.withdrawAsset)
          .then((res) => {
            if (res.success) {
              this.isAmountValid = res.balance >= (this.srcValue * Math.pow(10, config.assets[this.withdrawAsset].decimals))
              if (!this.isAmountValid) {
                this.errorText = 'insufficient funds'
                this.error = true
              } else {
                this.withdraw()
                  .then((res) => {
                    if (window.WavesKeeper.publicState()) {
                          window.WavesKeeper.signAndPublishTransaction(res.tx)
                              .then((result) => {
                                console.log(result)
                              }).catch((ex) => {
                            console.log(ex)
                          })
                        }
                  }).catch((ex) => {
                    console.log(ex)
                    this.errorText = 'gateway error'
                    this.error = true
                  })
              }
            }
          }).catch((ex) => {
            console.log(ex)
            this.errorText = 'unable to load balance'
            this.error = true
          })
      },
      withdraw () {
        let transfer = {
          type: 4,
          data: {
            amount: {
              tokens: this.srcValue,
              assetId: config.assets[this.withdrawAsset].assetId
            },
            fee: {
              tokens: '0.001',
              assetId: 'WAVES'
            }
          }
        }
        return new Promise((resolve, reject) => {
          if (this.withdrawAsset === 'WBTC') {
            axios.get(`${config.coinomatGatewayURL}/create_tunnel.php?currency_from=WBTC&currency_to=BTC&wallet_to=${this.toAddress}`)
              .then((response) => {
                axios.get(`${config.coinomatGatewayURL}/get_tunnel.php?xt_id=${response.data.tunnel_id}&k1=${response.data.k1}&k2=${response.data.k2}&history=0&lang=ru_RU`)
                  .then((response) => {
                    if (response.data && response.data.tunnel.wallet_from) {
                      transfer.data.recipient = response.data.tunnel.wallet_from
                      transfer.data.attachment = response.data.tunnel.attachment
                      resolve({ success: true, tx: transfer })
                    } else {
                      reject(new Error('Unable to load data for withdraw'))
                    }
                  }).catch((ex) => {
                    reject(new Error(ex))
                  })
              }).catch((ex) => {
                reject(new Error(ex))
              })
          } else {
            const buf = {
              assetId: config.assets[this.withdrawAsset].assetId,
              userAddress: this.toAddress
            }
            axios.post(`${config.wavesGatewayURL}/withdraw`, buf)
              .then((response) => {
                if (response.data && response.data.recipientAddress) {
                  transfer.data.recipient = response.data.recipientAddress
                  transfer.data.attachment = response.data.processId
                  resolve({ success: true, tx: transfer })
                } else {
                  reject(new Error('Unable to load data for withdraw'))
                } 
              }).catch((ex) => {
                console.log(ex)
                if (ex.response.data && ex.response.data.message) {
                  reject(new Error(ex.response.data.message))
                } else {
                  reject(new Error('something went wrong'))
                }
              })
          }
        })
      }
    }
  }
</script>

<style>
  .inline {
    min-height: 20px;
    margin-top: 10px;
    /*border: solid black 1px;*/
  }

  .red--text {
    color: red;
  }

  .green--text {
    color: green;
  }
</style>
