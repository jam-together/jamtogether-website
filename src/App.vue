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

<template>
  <main>
    <router-view />
  </main>
  <base-footer />

  <room-notifications />
</template>
