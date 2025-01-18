<template>
  <div v-show="room.queue.length" class="queue">
    <h4>{{ $t('room.components.queue.title') }} ({{ room.queue.length }})</h4>
    <ul>
      <li v-for="(track, index) in room.queue" :key="index">
        <img :src="track.image" :alt="track.name" />
        <div>
          {{ track.name }} - <span>{{ track.artists.join(', ') }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import useConnectedRoom from '@/stores/connectedRoom'
import { storeToRefs } from 'pinia'

const { room } = storeToRefs(useConnectedRoom())
</script>

<style lang="scss" scoped>
@import '@/scss/components/room/room-queue.scss';
</style>
