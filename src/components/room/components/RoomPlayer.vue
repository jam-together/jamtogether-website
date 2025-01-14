<template>
  <div class="player">
    <header>
      <h3>Son joué actuellement</h3>
      <h4 v-if="room.currentPlaying">
        {{ room.currentPlaying.name }} •
        <span>{{ room.currentPlaying.artists.join(', ') }}</span>
      </h4>
      <h4 v-else>Aucun son joué actuellement</h4>
    </header>
    <footer>
      <button
        @click="useRoomPlayer({ action: 'SKIP_PREVIOUS', roomId: room.id }).request()"
        class="icon previous"
      />
      <button
        @click="togglePlay(room.id)"
        class="icon"
        :class="{ pause: isMusicPlayed, play: !isMusicPlayed }"
      />
      <button
        @click="useRoomPlayer({ action: 'SKIP_NEXT', roomId: room.id }).request()"
        class="icon next"
      />
    </footer>
  </div>
</template>

<script lang="ts" setup>
import useRoomPlayer from '@/composables/room/useRoomPlayer'

defineProps({
  room: {
    type: Object,
    required: true,
  },
  togglePlay: {
    type: Function,
    required: true,
  },
  isMusicPlayed: {
    type: Boolean,
    required: true,
  },
})
</script>

<style lang="scss" scoped>
@import '@/scss/components/room/room-player.scss';
</style>
