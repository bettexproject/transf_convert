<template>
  <div class="exchange">
    <div class="exchange-title">
      Deposit
    </div>
    <div class="inline">
      <div class="exchange-text">Send coins on this addresses</div>
      <div class="input-group">
        <div class="input-group-place valid">
          <label for="amount">Address for deposit BTC</label>
          <input type="text" @click="copyToClipboard(wbtcAddress)" id="amount" v-model="wbtcAddress"/>
        </div>
      </div>
      <div class="input-group">
        <div class="input-group-place valid">
          <label for="amount4">Address for deposit ETH</label>
          <input type="text" @click="copyToClipboard(wethAddress)" id="amount4" v-model="wethAddress"/>
        </div>
      </div>
    </div>
    <!--<div class="inline">-->
      <!--<div class="green&#45;&#45;text">{{// wallet}}</div>-->
    <!--</div>-->
    <div class="inline">
      <div v-if="error" class="red--text">{{errorText}}</div>
    </div>
    <button @click="buttonClick">Hello</button>
    <!--<button @click="" :disabled="error">exchange</button>-->
  </div>
</template>

<script>
import axios from 'axios'
import config from '../config.js'
export default {
  name: 'Deposit',
  data: () => ({
    error: false,
    errorText: '',
    wethAddress: '',
    wbtcAddress: ''
  }),
  computed: {
    
  },
  methods: {
    buttonClick: function () {
      axios.get(`${config.coinomatGatewayURL}/create_tunnel.php?currency_from=BTC&currency_to=WBTC&wallet_to=${this.$store.getters.Address}`)
        .then((response) => {
          axios.get(`${config.coinomatGatewayURL}/get_tunnel.php?xt_id=${response.data.tunnel_id}&k1=${response.data.k1}&k2=${response.data.k2}&history=0&lang=ru_RU`)
            .then((response) => {
              this.wbtcAddress = response.data.tunnel.wallet_from
            }).catch((ex) => {
              console.log(ex)
            })
        }).catch((ex) => {
          console.log(ex)
        })

      const buf = {
        assetId: config.assets.WETH.assetId,
        userAddress: this.$store.getters.Address
      }
      axios.post(`${config.wavesGatewayURL}/deposit`, buf)
        .then((response) => {
          this.wethAddress = response.data.address
        }).catch((ex) => {
          console.log(ex)
        })
    },
    copyToClipboard: function (text) {
      navigator.clipboard.writeText(text);
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
