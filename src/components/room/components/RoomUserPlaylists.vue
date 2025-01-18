<template>
  <base-dynamic-sidebar
    @close="$emit('close')"
    :title="
      playlist
        ? playlist.name
        : `${$t('room.components.playlists.title')} (${playlists?.length ?? 0})`
    "
    :is-shown="true"
  >
    <template v-if="!isPlaylistLoading && !playlist">
      <template v-if="playlists">
        <ul class="playlists">
          <li @click="openPlaylist(playlist.id)" v-for="playlist in playlists" :key="playlist.id">
            <img :src="playlist.image" :alt="playlist.name" />
            <div>
              <h3>{{ playlist.name }}</h3>
              <h5>{{ playlist.description || 'Aucune description' }}</h5>
              <span class="icon arrow-right" />
            </div>
          </li>
        </ul>
      </template>
      <template v-else>
        <LoadingSpinner />
      </template>
    </template>
    <template v-else>
      <template v-if="isPlaylistLoading">
        <LoadingSpinner />
      </template>
      <template v-else>
        <button @click="closePlaylist" class="back-button icon back">
          {{ $t('room.components.playlists.backButton') }}
        </button>

        <ul class="playlist-items">
          <li v-for="track in playlist?.tracks" :key="track.id">
            <img :src="track.image" :alt="track.name" />
            <h4>
              {{ track.name }} <span>{{ track.artists.join(', ') }}</span>
            </h4>
            <button @click="addToQueue(track)" class="icon add-to-list" />
          </li>
        </ul>
      </template>
    </template>
  </base-dynamic-sidebar>
</template>

<script lang="ts" setup>
import BaseDynamicSidebar from '@/components/ui/BaseDynamicSidebar.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import useRoomOwnerPlaylists from '@/composables/room/useRoomOwnerPlaylists'
import useRoomPlayer from '@/composables/room/useRoomPlayer'
import useConnectedRoom from '@/stores/connectedRoom'
import type { IPlaylist, ITrack, TPlaylists } from '@/utils/types'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'

defineEmits(['close'])

const playlists = ref<TPlaylists | undefined>(undefined)
const playlist = ref<IPlaylist | undefined>(undefined)
const isPlaylistLoading = ref<boolean>(false)

const { room } = storeToRefs(useConnectedRoom())

const openPlaylist = async (id: string) => {
  isPlaylistLoading.value = true
  playlist.value = await useRoomOwnerPlaylists().fetchPlaylist(id)
  isPlaylistLoading.value = false
}
const closePlaylist = () => {
  playlist.value = undefined
}
const addToQueue = async (track: ITrack) => {
  await useRoomPlayer({
    action: 'ADD_TO_QUEUE',
    body: { track },
    roomId: room.value.id,
  }).request()
}

onMounted(async () => {
  playlists.value = await useRoomOwnerPlaylists().fetchPlaylists()
})
</script>

<style lang="scss" scoped>
@import '@/scss/components/room/room-user-playlists.scss';
</style>
