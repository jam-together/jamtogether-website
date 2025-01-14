<template>
  <div ref="searchbarRef" class="search-field">
    <div @click="isSearchbarOpened = true" class="search-area">
      <input v-model="searchQuery" placeholder="Rechercher dans la bibliothèque spotify" />
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
        <loading-spinner />
      </template>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import useRoomMusicSearch from '@/composables/room/useRoomMusicSearch'
import { debunce, triggerWhenFound } from '@/utils/globalUtils'
import type { ITrack } from '@/utils/types'
import useRoomPlayer from '@/composables/room/useRoomPlayer'

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
    } else {
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
