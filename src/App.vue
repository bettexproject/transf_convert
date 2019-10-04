<template>
  <div id="app">
    <Exchange />
    <Withdraw />
    <Deposit />
  </div>
</template>

<script>
import Exchange from './components/Exchange.vue'
import Withdraw from './components/Withdraw.vue'
import Deposit from './components/Deposit.vue'

export default {
  name: 'app',
  components: {
    Exchange,
    Withdraw,
    Deposit
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
