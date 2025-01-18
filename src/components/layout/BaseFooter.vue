<template>
  <footer>
    JamTogether v{{ packageJSON.version }} | {{ $t('footer.madeBy') }}
    <a href="https://ballon2zipette.com" target="_blank">Ballon2zipette-corp</a>
  </footer>
</template>

<script lang="ts" setup>
import packageJSON from '../../../package.json'
</script>

<style lang="scss" scoped>
footer {
  text-align: center;
  color: $gray-1;
  padding: 2em 0;
  & > a {
    color: $gray-2;
    text-decoration: underline;
  }
}
</style>
