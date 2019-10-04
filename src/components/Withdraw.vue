<template>
  <div>
    <div class="inline">
      <input type="text" v-model="srcValue"/>
      <input type="radio" value="WBTC" v-model="srcAsset"><label>BTC</label>
      <input type="radio" value="WETH" v-model="srcAsset"><label>ETH</label>
    </div>
    <div class="inline">
      Address: <input type="text" v-model="toAddress"/>
    </div>
    <div class="inline">
        <div class="green--text">{{wallet}}</div>
    </div>
    <div class="inline">
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
    toAddress: ''
  }),
  computed: {
    srcAsset: {
      get () {
        return this.$store.getters.ExchangeSrcAsset
      },
      set (value) {
        this.$store.commit('setSrcAsset', (value))
      }
    },
    srcValue: {
      get () {
        return this.$store.getters.ExchangeValue
      },
      set (value) {
        this.$store.commit('setExValue', value)
      }
    }
  },
  mounted () {
    // api.calculateChangerSum('4LHHvYGNKJUg5hj65aGD5vgScvCBmLpdRFtjokvCjSL8', 'WAVES')
  },
  methods: {
    buttonClick: function () {
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
                  this.error = true
                  this.errorText = res.message
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
  border: solid black 1px;
}

.red--text {
  color: red;
}
.green--text {
  color: green;
}
</style>
