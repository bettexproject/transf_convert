<template>
  <div class="exchange">
    <div class="exchange-title">
      Convert
    </div>
    <div class="inline">

      <div class="exchange-text">Convert from</div>
      <div class="input-group">
        <div class="input-group-place" :class="isAmountValid ? 'valid' : 'invalid'">
          <label for="amount">Amount {{srcAsset}}</label>
          <input type="text" id="amount" v-model="srcValue"/>
        </div>
      </div>
      <div class="asset-list">
        <input type="radio" id="fWUSD" value="WUSD" v-model="srcAsset"><label for="fWUSD">USD</label>
        <input type="radio" id="fWBTC" value="WBTC" v-model="srcAsset"><label for="fWBTC">BTC</label>
        <input type="radio" id="fWETH" value="WETH" v-model="srcAsset"><label for="fWETH">ETH</label>
        <input type="radio" id="fWAVES" value="WAVES" v-model="srcAsset"><label for="fWAVES">WAVES</label>
        <input type="radio" id="fVostok" value="Vostok" v-model="srcAsset" disabled><label for="fVostok">VST</label>
        <input type="radio" id="fBTXC" value="BTXC" v-model="srcAsset" disabled><label for="fBTXC">BTXC</label>
      </div>
    </div>
    <div class="inline">
      <div class="exchange-text">Convert into</div>
      <input type="radio" value="WUSD" id="tWUSD" v-model="dstAsset"
             :disabled="!['WBTC', 'WETH', 'WAVES'].includes(srcAsset)"><label for="tWUSD">USD</label>
      <input type="radio" value="WBTC" id="tWBTC" v-model="dstAsset"
             :disabled="!['WUSD', 'WAVES'].includes(srcAsset)"><label for="tWBTC">BTC</label>
      <input type="radio" value="WETH" id="tWETH" v-model="dstAsset"
             :disabled="!['WUSD', 'WAVES'].includes(srcAsset)"><label for="tWETH">ETH</label>
      <input type="radio" value="WAVES" id="tWAVES" v-model="dstAsset"
             :disabled="!['WBTC', 'WETH', 'WUSD'].includes(srcAsset)"><label for="tWAVES">WAVES</label>
      <input type="radio" value="Vostok" id="tVostok" v-model="dstAsset" disabled><label for="tVostok">VST</label>
      <input type="radio" value="BTXC" id="tBTXC" v-model="dstAsset" disabled><label for="tBTXC">BTXC</label>
    </div>
    <div class="inline">
      <div class="exchange-text">Convert into</div>
      <div class="exchange-out">{{sum}} {{dstAsset}}
        <div class="exchange-currency">1 {{srcAsset}} ≈ 3 {{dstAsset}}</div>
      </div>

    </div>
    <!--<button @click="buttonClick">Hello</button>-->
    <button @click="exchange" :disabled="error" class="exchange-button">Convert {{srcAsset}} to {{dstAsset}}</button>
    <div class="inline">
      <div v-if="error" class="red--text">{{errorText}}</div>
    </div>
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
        get() {
          return this.$store.getters.ExchangeSrcAsset
        },
        set(value) {
          this.$store.commit('setSrcAsset', (value))
        }
      },
      dstAsset: {
        get() {
          return this.$store.getters.ExchangeDstAsset
        },
        set(value) {
          this.$store.commit('setDstAsset', (value))
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

  .exchange-title {
    font-size: 18px;
    color: #343B4C;
    letter-spacing: 0;
    text-align: left;
  }

  .exchange {
    max-width: 350px;
    margin: auto;
    background: var(--btx-white);
    padding: 16px;
    margin: 16px;
    box-sizing: border-box;
    border-radius: 8px;
  }

  .exchange-out {
    font-family: GTWalsheimProMedium;
    font-size: 24px;
    color: #343B4C;
    letter-spacing: 0;
    text-align: left;
  }

  .exchange-currency {
    font-family: GTWalsheimProLight;
    font-size: 12px;
    color: #525252;
    letter-spacing: 0;
    text-align: left;
  }

  .inline {
    min-height: 20px;
    margin-top: 10px;
    /*border: solid black 1px;*/
    display: flex;
    align-items: top;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .input-group {
    flex-basis: calc(50% - 4px);
  }

  .asset-list {
    display: flex;
    flex-wrap: wrap;
    flex-basis: calc(50% - 4px);
  }

  .red--text {
    color: red;
  }

  .exchange-button {
    background: #4F5973;
    border-radius: 4px;
    font-weight: 600;
    font-size: 14px;
    color: #FBFBFD;
    letter-spacing: 0;
    text-align: center;
    width: 100%;
    display: block;
    padding: 8px 16px;
  }

  .exchange-text {
    flex: none;
    width: 100%;
    text-align: left;
    margin-bottom: 4px;
    font-size: 14px;
    color: #4F5973;
    letter-spacing: 0;
  }

  input[type="radio"] {
    visibility: hidden;
    height: 0;
    width: 0;
    margin: 0;
  }

  input[type="radio"] + label {
    display: inline-block;
    vertical-align: middle;
    text-align: center;
    cursor: pointer;
    color: #343B4C;
    letter-spacing: 0;
    padding: 5px 10px;
    border-radius: 4px;
    background: #F4F7FB;
    border: 1px solid #DADDE0;
    border-radius: 4px;
    font-size: 12px;
    color: #343B4C;
    letter-spacing: 0;
    text-align: center;
    margin: 2px;
  }

  .input-group-place {
    background: var(--btx-white);
    border: 1px solid #4F5973;
    border-radius: 4px;
    padding: 4px 8px;
    text-align: left;
  }

  .input-group-place label {
    font-size: 14px;
    color: var(--blue);
    letter-spacing: 0;
  }

  .input-group-place input {
    width: 100%;
    border: none;
    font-weight: 600;
    font-size: 16px;
    color: var(--btx-black);
    letter-spacing: 0;
    background: var(--btx-white);
    cursor: pointer;
  }

  .input-group-place select {
    display: block;
    border: none;
    background: var(--btx-white);
    width: 100%;
    font-weight: 600;
    text-indent: 0;
    text-overflow: '';
    font-size: 16px;
    color: var(--blue);
    letter-spacing: 0;
    /*appearance: none;*/
    padding: 0;
  }

  .input[type="radio"] + label:not(:last-of-type) {
    margin-right: 8px;
  }

  input[type="radio"]:checked + label {
    background: var(--btx-black);
    font-size: 12px;
    color: #F4F7FB;
    letter-spacing: 0;
    text-align: center;
  }

  input[type="radio"]:disabled + label {
    opacity: .5;
  }


</style>
