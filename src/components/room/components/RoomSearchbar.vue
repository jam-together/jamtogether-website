<template>
  <div ref="searchbarRef" class="search-field">
    <div @click="isSearchbarOpened = true" class="search-area">
      <button type="button" @click="playlistsShown = true" class="icon playlist-icon" />
      <input v-model="searchQuery" :placeholder="$t('room.components.searchbar.searchText')" />
      <span class="icon search-icon" />
    </div>

    <ul :class="{ active: isSearchbarOpened }" class="search-results">
      <template v-if="!searchLoading">
        <li @click="() => requestSong(item)" v-for="item in searchItems" :key="item.id">
          <img :alt="item.name" :src="item.image" />
          <div>
            <span class="title">{{ item.name }}</span>
            <span class="artists">{{ item.artists.join(',') }}</span>
          </div>
        </li>
      </template>
      <template v-else>
        <LoadingSpinner />
      </template>
    </ul>
  </div>

  <template v-if="playlistsShown">
    <room-user-playlists @close="playlistsShown = false" />
  </template>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import useRoomMusicSearch from '@/composables/room/useRoomMusicSearch'
import { debunce, triggerWhenFound } from '@/utils/globalUtils'
import type { ITrack } from '@/utils/types'
import useRoomPlayer from '@/composables/room/useRoomPlayer'
import RoomUserPlaylists from './RoomUserPlaylists.vue'

const playlistsShown = ref<boolean>(false)

const props = defineProps({
  roomId: {
    type: String,
    required: true,
  },
})

const {
  isLoading: searchLoading,
  items: searchItems,
  search: handleSearch,
  reset: resetSearch,
} = useRoomMusicSearch()
const searchQuery = ref('')
const searchbarRef = ref(null)
const isSearchbarOpened = computed({
  get: () => {
    return searchLoading.value || searchItems.value.length > 0
  },
  set: (value) => {
    if (!value) {
      resetSearch()
    } else if (searchQuery.value?.trim() !== '') {
      searchQuery.value = searchQuery.value + ' '
    }
  },
})

watch(searchQuery, (query) => {
  debunce(async (q: string) => {
    if (!q.trim()) return
    await handleSearch(props.roomId, q)
  }, 300)(query)
})

const clearSearch = () => {
  resetSearch()
  searchQuery.value = ''
}

const clickingOutsideSearchbar = (event: Event) => {
  triggerWhenFound(event.target as HTMLElement, searchbarRef.value!, (isFound: boolean) => {
    if (!isFound) {
      isSearchbarOpened.value = false
    }
  })
}

const requestSong = async (item: ITrack) => {
  clearSearch()
  await useRoomPlayer({
    action: 'ADD_TO_QUEUE',
    body: { track: item },
    roomId: props.roomId,
  }).request()
}

onMounted(() => {
  window.addEventListener('click', clickingOutsideSearchbar)
})
onBeforeUnmount(() => {
  window.removeEventListener('click', clickingOutsideSearchbar)
})
</script>

<style lang="scss" scoped>
@import '@/scss/components/room/room-searchbar.scss';
</style>
