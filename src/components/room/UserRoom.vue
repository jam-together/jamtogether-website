<template>
  <page-state-manager :is-loading="isLoading" :error="error">
    <div v-if="room" class="wrapper">
      <room-header
        @show-members="isMembersSidebarShown = true"
        @show-history="isHistorySidebarShown = true"
        :disconnect="disconnect"
        :room="room"
      />
      <room-player :toggle-play="togglePlay" :is-music-played="isMusicPlayed" :room="room" />
      <room-queue :room="room" />
    </div>
  </page-state-manager>

  <history-sidebar
    :history="room?.history ?? []"
    @close="isHistorySidebarShown = false"
    :is-shown="isHistorySidebarShown"
  />

  <members-sidebar
    :members="room?.members ?? []"
    @close="isMembersSidebarShown = false"
    :is-shown="isMembersSidebarShown"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, watch } from 'vue'

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
const room = computed({
  get: () => data.value?.room ?? null,
  set: (value) => {
    if (!data.value) return
    data.value.room = { ...data.value.room, ...value }
  },
})
watch(data, async (value) => {
  if (value) {
    useAuthenticationStore().store(value.accessToken)
  }
  if (me.value) {
    useWebsocketStore().initSocket(me.value!.clientId)
  }
})

const { isMusicPlayed, togglePlay, setPlayed } = useRoomMusicPlayToggle()
watch(room, (value) => {
  if (value) {
    setPlayed(value.player?.isPlaying ?? false)
  }
})
/** ROOM INITIALIZATION */

/* WS EVENTS */
watch(
  websocket,
  (ws) => {
    if (ws && room.value) {
      useRoomEvents().init({
        websocket: ws,
        room: room,
        functions: {
          disconnect,
          setPlayed,
        },
      })
    }
  },
  { immediate: true },
)
/* END WS EVENTS */

/**  Disconnect room function */
const disconnect = async () => {
  await router.push({ name: 'home' })
  useWebsocketStore().close()
  useAuthenticationStore().reset()
}
</script>

<style lang="scss" scoped>
@import '@/scss/components/user-room';
</style>
