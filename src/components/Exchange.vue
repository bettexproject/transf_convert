<template>
  <div>
    <div class="inline">
      <input type="text" v-model="srcValue"/>
      <input type="radio" value="WUSD" v-model="srcAsset"><label>USD</label>
      <input type="radio" value="WBTC" v-model="srcAsset"><label>BTC</label>
      <input type="radio" value="WETH" v-model="srcAsset"><label>ETH</label>
      <input type="radio" value="WAVES" v-model="srcAsset"><label>WAVES</label>
      <input type="radio" value="Vostok" v-model="srcAsset" disabled><label>VST</label>
      <input type="radio" value="BTXC" v-model="srcAsset" disabled><label>BTXC</label>
    </div>
    <div class="inline">
      <input type="radio" value="WUSD" v-model="dstAsset" :disabled="!['WBTC', 'WETH', 'WAVES'].includes(srcAsset)"><label>USD</label>
      <input type="radio" value="WBTC" v-model="dstAsset" :disabled="!['WUSD', 'WAVES'].includes(srcAsset)"><label>BTC</label>
      <input type="radio" value="WETH" v-model="dstAsset" :disabled="!['WUSD', 'WAVES'].includes(srcAsset)"><label>ETH</label>
      <input type="radio" value="WAVES" v-model="dstAsset" :disabled="!['WBTC', 'WETH', 'WUSD'].includes(srcAsset)"><label>WAVES</label>
      <input type="radio" value="Vostok" v-model="dstAsset" disabled><label>VST</label>
      <input type="radio" value="BTXC" v-model="dstAsset" disabled><label>BTXC</label>
    </div>
    <div class="inline">
      <div>{{sum}}</div>
    </div>
    <div class="inline">
    </div>
    <div class="inline">
      <div v-if="error" class="red--text">{{errorText}}</div>
    </div>
    <button @click="buttonClick">Hello</button>
    <button @click="exchange" :disabled="error">exchange</button>
  </div>
</template>

<script>
export default {
  name: 'Exchange',
  data: () => ({
    text: '',
    error: false,
    errorText: '',
    sum: 0
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
    dstAsset: {
      get () {
        return this.$store.getters.ExchangeDstAsset
      },
      set (value) {
        this.$store.commit('setDstAsset', (value))
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
            this.$store.dispatch('calculateExData').then((res) => {
              if (res.success) {
                this.sum = res.summary
                this.error = false
              } else {
                this.errorText = 'something went wrong'
                this.error = true
              }
            })
          }
        }).catch((ex) => {
          this.errorText = 'something went wrong'
          this.error = true
        })
    },
    exchange: function () {
      this.$store.dispatch('exchange')
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
</style>
