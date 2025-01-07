<script setup lang="ts">
import { RouterView } from 'vue-router'

import BaseFooter from './components/layout/BaseFooter.vue'
</script>

<template>
  <main>
    <router-view />
  </main>
  <base-footer />
</template>
