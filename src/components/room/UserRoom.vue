<template>
  <page-state-manager :is-loading="isLoading" :error="error">
    <div v-if="room" class="wrapper">
      <room-header
        @show-members="isMembersSidebarShown = true"
        @show-history="isHistorySidebarShown = true"
        :disconnect="disconnect"
      />
      <room-player :toggle-play="togglePlay" :is-music-played="isMusicPlayed" />
      <room-queue />
    </div>

    <history-sidebar @close="isHistorySidebarShown = false" :is-shown="isHistorySidebarShown" />
    <members-sidebar @close="isMembersSidebarShown = false" :is-shown="isMembersSidebarShown" />
  </page-state-manager>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { ref, watch } from 'vue'

import { useWebsocketStore } from '@/stores/websocket.ts'
import { useAuthenticationStore } from '@/stores/authentication'

import { type IRoom } from '@/utils/types.ts'

import useRoomMusicPlayToggle from '@/composables/room/useRoomMusicPlayToggle.ts'

import useAPIRequest from '@/composables/useAPIRequest.ts'

import RoomHeader from './components/RoomHeader.vue'
import RoomPlayer from './components/RoomPlayer.vue'
import RoomQueue from './components/RoomQueue.vue'

import HistorySidebar from './components/sidebars/HistorySidebar.vue'
import MembersSidebar from './components/sidebars/MembersSidebar.vue'

import PageStateManager from '@/components/utils/PageStateManager.vue'
import useRoomEvents from '@/composables/room/useRoomEvents'
import useConnectedRoom from '@/stores/connectedRoom'
import useRoomLeave from '@/composables/room/useRoomLeave'

const route = useRoute()
const router = useRouter()

const roomId = ref<string>(route.params.id as string)

// sidebars
const isMembersSidebarShown = ref<boolean>(false)
const isHistorySidebarShown = ref<boolean>(false)

// fetch room data
const { isLoading, data, error } = useAPIRequest<{ accessToken: string; room: IRoom }>({
  endpoint: '/rooms/get/' + roomId.value,
  immediate: true,
})

/** ROOM INITIALIZATION */
const { websocket } = storeToRefs(useWebsocketStore())
const { me } = storeToRefs(useAuthenticationStore())
const { room, isMusicPlayed } = storeToRefs(useConnectedRoom())

watch(
  data,
  async (value) => {
    if (value) {
      useAuthenticationStore().store(value.accessToken)
      useConnectedRoom().init(value.room)
    }
    if (me.value && !websocket.value) {
      useWebsocketStore().initSocket(me.value!.clientId)
    }
  },
  { immediate: true },
)

const { togglePlay } = useRoomMusicPlayToggle()
watch(room, (value) => {
  if (value) {
    useConnectedRoom().setPlayed(value.player?.isPlaying ?? false)
  }
})
/** ROOM INITIALIZATION */

/**  Disconnect room function */
const disconnect = async () => {
  await router.push({ name: 'home' })
  useWebsocketStore().close()
  //useAuthenticationStore().reset()
  await useRoomLeave().request()
}

/* WS EVENTS */
watch(
  websocket,
  (ws) => {
    if (ws && room.value) {
      useRoomEvents().init()
    }
  },
  { immediate: true, once: true },
)
/* END WS EVENTS */

// /* HOOKS */
// onMounted(() => {
//   window.addEventListener('unload', disconnect)
// })
// onBeforeUnmount(() => {
//   window.removeEventListener('unload', disconnect)
// })
</script>

<style lang="scss" scoped>
@import '@/scss/components/user-room';
</style>
