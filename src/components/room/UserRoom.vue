<template>
  <page-state-manager v-if="!!me" :is-loading="isLoading" :error="error">
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

  <div class="primary input-name" v-else>
    <h3>Entrer un nom d'utilisateur</h3>
    <input type="text" placeholder="User 1" v-model="username" />
    <button
      class="primary"
      @click="joinRoom"
      :disabled="username.length < 3"
    >
      Confirmer
    </button>
  </div>
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

const username = ref<string>('')

// sidebars
const isMembersSidebarShown = ref<boolean>(false)
const isHistorySidebarShown = ref<boolean>(false)

// user store
const { me, accessToken } = storeToRefs(useAuthenticationStore())

// fetch room data
const { isLoading, data, error, handleRequest } = useAPIRequest<{
  accessToken: string
  room: IRoom
}>({
  endpoint: '/rooms/join/' + roomId.value,
  immediate: !!accessToken.value,
  method: 'POST',
})

/** ROOM INITIALIZATION */
const { websocket } = storeToRefs(useWebsocketStore())
const { room, isMusicPlayed } = storeToRefs(useConnectedRoom())

watch(
  data,
  async (value) => {
    if (value) {
      useAuthenticationStore().store(value.accessToken)
      useConnectedRoom().init(value.room)
    }
    if (me.value && !websocket.value) {
      useWebsocketStore().initSocket(me.value.clientId)
    }
  },
  { immediate: true },
)

watch(error, (err) => {
  window.room.modal.open({
    type: 'ERROR',
    title: err?.message ?? "Unknown error"
  })
})

const { togglePlay } = useRoomMusicPlayToggle()
watch(room, (value) => {
  if (value) {
    useConnectedRoom().setPlayed(value.player?.isPlaying ?? false)
  }
})
/** ROOM INITIALIZATION */

// join the current room (with a username)
const joinRoom = async () => {
  await handleRequest({
    body: {
      ... username.value && {name: username.value}
    }
  })
}

/**  Disconnect room function */
const disconnect = async () => {
  await router.push({ name: 'home' })
  useWebsocketStore().close()
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
</script>

<style lang="scss" scoped>
@import '@/scss/components/user-room';

.input-name {
  position: absolute;
  left: 50%;
  top: 45%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50%;
  gap: 1em;

  @media screen and (max-width: 750px) {
    width: 95%;
  }

  h3 {
    text-align: center;
  }

  button {
    width: 100%;
  }
}
</style>
