<template>
  <div>
    <div class="inline">
      <input type="radio" value="WBTC" v-model="srcAsset"><label>BTC</label>
      <input type="radio" value="WETH" v-model="srcAsset"><label>ETH</label>
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
  name: 'Deposit',
  data: () => ({
    error: false,
    errorText: '',
    wallet: ''
  }),
  computed: {
    srcAsset: {
      get () {
        return this.$store.getters.ExchangeSrcAsset
      },
      set (value) {
        this.$store.commit('setSrcAsset', (value))
      }
    }
  },
  methods: {
    buttonClick: function () {
      this.$store.dispatch('deposit')
        .then((res) => {
          if (res.success) {
            this.wallet = res.message
          } else {
            this.error = true
            this.errorText = res.message
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
  border: solid black 1px;
}

.red--text {
  color: red;
}
.green--text {
  color: green;
}
</style>
