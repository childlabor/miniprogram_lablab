<template>
  <div>
    <web-view :src="getUrl"></web-view>
  </div>
</template>

<script>

export default {
  data () {
    return {}
  },

  computed: {
    getUrl: function () {
      return this.$root.$mp.query.type
    }
  },
  mounted() {
    console.log(this.getUrl);
  }
}
</script>

<style>

</style>
