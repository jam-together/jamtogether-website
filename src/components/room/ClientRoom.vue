<template>
  <template v-if="isLoading && !error">
    <loading-spinner />
  </template>
  <template v-else-if="!isLoading && error">
    <div class="error">
      <h2>Une erreur est survenue..</h2>
      <h3>{{error}}</h3>
    </div>
  </template>
  <template v-else-if="room">
    <div class="wrapper">
      <header>
        <h3 class="room-id">CODE <span>{{ room.id }}</span></h3>

        <div ref="searchbarRef" class="search-field">
          <div @click="isSearchbarOpened = true" class="search-area">
            <input v-model="searchQuery" placeholder="Rechercher dans la bibliothèque spotify" />
            <span class="icon search-icon" />
          </div>

          <ul :class="{'active': isSearchbarOpened}" class="search-results">
            <template v-if="!searchLoading">
              <li @click="() => requestSong(item)" v-for="item in searchItems" :key="item.id">
                <img :alt="item.name" :src="item.image" />
                <div>
                  <span class="title">{{ item.name }}</span>
                  <span class="artists">{{ item.artists.join(",") }}</span>
                </div>
              </li>
            </template>
            <template v-else>
              <loading-spinner />
            </template>
          </ul>
        </div>
      </header>

      <div class="player">
        <header>
          <h3>Son joué actuellement</h3>
          <h4 v-if="room.currentPlaying">
            {{ room.currentPlaying.name }} • <span>{{ room.currentPlaying.artists.join(", ") }}</span>
          </h4>
          <h4 v-else>
            Aucun son joué actuellement
          </h4>
        </header>
        <footer>
          <button @click="useRoomSkipPrevious().request(roomId)" class="icon previous" />
          <button @click="togglePlay(roomId)" class="icon" :class="{'pause': isMusicPlayed, 'play': !isMusicPlayed}" />
          <button @click="useRoomSkipNext().request(roomId)" class="icon next" />
        </footer>
      </div>

      <div v-show="room.queue.length" class="queue">
        <h4>File d'attente ({{ room.queue.length }})</h4>
        <ul>
          <li v-for="track in room.queue" :key="track.id">
            <img :src="track.image" :alt="track.name" />
            <div>
              {{ track.name }} - <span>{{ track.artists.join(", ")}}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import useAPIRequest from '@/composables/useAPIRequest.ts'
import { useRoute } from 'vue-router'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useWebsocketStore } from '@/stores/websocket.ts'
import { type IRoom, type ITrack, RoomEvents } from '@/utils/types.ts'
import useRoomMusicSearch from '@/composables/room/useRoomMusicSearch.ts'
import { debunce, triggerWhenFound } from '@/utils/globalUtils.ts'
import useRoomSongRequest from '@/composables/room/useRoomSongRequest.ts'
import { useSpotifyAuth } from '@/stores/spotifyAuth.ts'
import useRoomSkipNext from '@/composables/room/useRoomSkipNext.ts'
import useRoomSkipPrevious from '@/composables/room/useRoomSkipPrevious.ts'
import { storeToRefs } from 'pinia'
import useRoomMusicPlayToggle from '@/composables/room/useRoomMusicPlayToggle.ts'

const route = useRoute();
const roomId = ref<string>(route.params.id as string);
const clientId = ref<string>(route.query['client-id'] as string);

const {websocket} = storeToRefs(useWebsocketStore());
const {isLoading, data, error} = useAPIRequest<{ room: IRoom }>({
  endpoint: "/rooms/get/" + roomId.value,
  immediate: true
});
const room = computed({
  get: () => data.value?.room ?? null,
  set: value => {
    if(!data.value) return;
    data.value.room = {...data.value.room, ...value};
  }
});

const {isLoading: searchLoading, items: searchItems, search: handleSearch, reset: resetSearch} = useRoomMusicSearch();
const searchQuery = ref("");
const searchbarRef = ref(null);
const isSearchbarOpened = computed({
  get: () => {
    return searchLoading.value || searchItems.value.length > 0
  },
  set: (value) => {
    if(!value) {
      resetSearch();
    } else {
      searchQuery.value = searchQuery.value + " ";
    }
  }
});

const {isMusicPlayed, togglePlay, setPlayed} = useRoomMusicPlayToggle();

watch(clientId, (value) => {
  if(!value) return;
  useWebsocketStore().initSocket(value);
}, {immediate: true});
watch(searchQuery, (query) => {
  debunce(async (q) => {
    await handleSearch(roomId.value, q);
  }, 300)(query);
});
watch(room, value => {
  if(value) {
    setPlayed(value.isPlaying);
  }
})

/* FUNCTIONS */
function clearSearch() {
  resetSearch();
  searchQuery.value = "";
}

function clickingOutsideSearchbar(event: Event) {
  triggerWhenFound(event.target as HTMLElement, searchbarRef.value!, (isFound: boolean) => {
    if(!isFound) {
      isSearchbarOpened.value = false;
    }
  });
}

async function requestSong(item: ITrack) {
  clearSearch();
  await useRoomSongRequest().request(roomId.value, item);
}
/* END FUNCTIONS */

/* WS EVENTS */
watch(websocket, ws => {
  if(!ws) return;
  ws.onmessage = (event: MessageEvent) => {
    const data = event.data;
    if(!data) return;

    const m: RoomEvents.IncomingMessage = JSON.parse(data);
    if(m.type === "MUSIC_ADDED" || m.type === "MUSIC_REMOVED") {
      const message = m as RoomEvents.IncomingMessage<RoomEvents.Music.Added|RoomEvents.Music.Removed>;
      const track = message.data?.track;
      if(!track || !room.value) return;
      room.value.queue = [track, ...room.value.queue];
    } else if(m.type === "MUSIC_PAUSED") {
      setPlayed(true);
    } else if(m.type === "MUSIC_PLAYED") {
      setPlayed(false);
    }

    if(m.type === "MUSIC_PAUSED" || m.type === "MUSIC_PLAYED" || m.type === "MUSIC_SWITCHED") {
      const message = m as RoomEvents.IncomingMessage<RoomEvents.Music.Paused|RoomEvents.Music.Played|RoomEvents.Music.Switched>;
      const newTrack = message.data?.newTrack;
      const queue = message.data?.newQueue;

      if(!newTrack || !queue || !room.value) return;
      room.value.currentPlaying = newTrack;
      room.value.queue = queue;
    }
  }
}, { immediate: true });
/* END WS EVENTS */

/* HOOKS */
onMounted(() => {
  useSpotifyAuth();
  window.addEventListener("click", clickingOutsideSearchbar);
});
onBeforeUnmount(() => {
  window.removeEventListener("click", clickingOutsideSearchbar);
});
</script>

<style lang="scss" scoped>
@import "@/scss/components/client-room";
</style>
