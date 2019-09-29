<template>
  <div>{{msg}}
    <button @click="buttonClick">Hello</button>
  </div>
</template>

<script>
export default {
  name: 'Exchange',
  props: {
    msg: String
  },
  mounted () {
    // api.calculateChangerSum('4LHHvYGNKJUg5hj65aGD5vgScvCBmLpdRFtjokvCjSL8', 'WAVES')
  },
  methods: {
    buttonClick: function () {
      this.$store.dispatch('calculateExchangeData')
    }
  }
}
</script>
