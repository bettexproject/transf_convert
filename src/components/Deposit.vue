<template>
  <div class="exchange">
    <div class="exchange-title">
      Deposit
    </div>
    <div class="inline">
      <div class="exchange-text">Send coins on this addresses</div>
      <div class="input-group">
        <div class="input-group-place" :class="isAmountValid ? 'valid' : 'invalid'">
          <label for="amount">Address for deposit BTC</label>
          <input type="text" id="amount" v-model="wallet"/>
        </div>
      </div>
      <div class="input-group">
        <div class="input-group-place" :class="isAmountValid ? 'valid' : 'invalid'">
          <label for="amount4">Address for deposit ETH</label>
          <input type="text" id="amount4" v-model="wallet"/>
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
  export default {
    name: 'Deposit',
    data: () => ({
      error: false,
      errorText: '',
      wallet: '123456789'
    }),
    computed: {
      srcAsset: {
        get() {
          return this.$store.getters.ExchangeSrcAsset
        },
        set(value) {
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
    /*border: solid black 1px;*/
  }

  .red--text {
    color: red;
  }

  .green--text {
    color: green;
  }
</style>
