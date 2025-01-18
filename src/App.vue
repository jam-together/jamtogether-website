<script setup lang="ts">
import { RouterView } from 'vue-router'

import BaseFooter from './components/layout/BaseFooter.vue'
import RoomNotifications, {
  type INotificationParams,
} from './components/room/components/RoomNotifications.vue'

declare global {
  interface Window {
    room: { modal: { open: (notification: INotificationParams) => void } }
  }
}
</script>

<!-- <script lang="ts">
export default {
  name: 'App',
  metaInfo: {
    title: 'JamTogether',
    titleTemplate: '%s | JamTogether',
    meta: [
      {"http-equiv": 'Content-Type', content: 'text/html; charset=utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {name: 'description', content: 'The power of music in all hands.'},

      {property: 'og:title', content: 'JamTogether'},
      {property: 'og:site_name', content: 'JamTogether'},
      {property: 'og:type', content: 'website'},
      {property: 'og:url', content: 'https://www.my-site.com/my-special-page'},
      {property: 'og:image', content: 'https://www.my-site.com/my-special-image.jpg'},
      {property: 'og:description', content: 'The power of music in all hands.'},

      {name: 'twitter:card', content: 'summary'},
      {name: 'twitter:title', content: 'JamTogether'},
      {name: 'twitter:description', content: 'The power of music in all hands.'},

      // Google / Schema.org markup:
      {itemprop: 'name', content: 'JamTogether'},
      {itemprop: 'description', content: 'The power of music in all hands.'},
      {itemprop: 'image', content: 'http://jamtogether.fr/images/logo.png'}
    ]
  }

}
</script> -->

<template>
  <main>
    <router-view />
  </main>
  <base-footer />

  <room-notifications />
</template>
