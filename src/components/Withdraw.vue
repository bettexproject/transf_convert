<template>
  <div class="exchange">
    <div class="exchange-title">
      Withdraw
    </div>
    <div class="inline">
      <div class="input-group-place" :class="isAmountValid ? 'valid' : 'invalid'">
        <label for="srcValue">Amount {{srcAsset}} </label>
        <input type="text" id="srcValue" v-model="srcValue"/>
      </div>
      <div class="asset-list">
        <input type="radio" id="fWBTC" value="WBTC" v-model="srcAsset"><label for="fWBTC">BTC</label>
        <input type="radio" id="fWETH" value="WETH" v-model="srcAsset"><label for="fWETH">ETH</label>
      </div>
    </div>
    <div class="inline">
      <div class="input-group-place" :class="isAmountValid ? 'valid' : 'invalid'">
        <label for="amount">Your {{srcAsset}} address </label>
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
  export default {
    name: 'Withdraw',
    data: () => ({
      error: false,
      errorText: '',
      wallet: '',
      toAddress: '',
      isAmountValid: true
    }),
    computed: {
      srcAsset: {
        get() {
          return this.$store.getters.ExchangeSrcAsset
        },
        set(value) {
          this.$store.commit('setSrcAsset', (value))
        }
      },
      srcValue: {
        get() {
          return this.$store.getters.ExchangeValue
        },
        set(value) {
          this.$store.commit('setExValue', value)
        }
      }
    },
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
        this.checkData()
      },
      checkData: function () {
        this.$store.dispatch('checkBalance')
            .then((success) => {
              if (!success) {
                this.errorText = 'insufficient funds'
                this.error = true
              } else {
                this.$store.dispatch('withdraw', this.toAddress)
                    .then((res) => {
                      if (res.success) {
                        console.log(res.tx)
                        if (window.WavesKeeper.publicState()) {
                          window.WavesKeeper.signAndPublishTransaction(res.tx)
                              .then((result) => {
                                console.log(result)
                              }).catch((ex) => {
                            console.log(ex)
                          })
                        }
                      } else {
                        this.errorText = res.message
                        this.error = true
                      }
                    })
              }
            }).catch((ex) => {
          this.errorText = 'something went wrong'
          this.error = true
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
