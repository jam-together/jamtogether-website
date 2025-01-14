<template>
  <div v-show="room.queue.length" class="queue">
    <h4>File d'attente ({{ room.queue.length }})</h4>
    <ul>
      <li v-for="track in room.queue" :key="track.id">
        <img :src="track.image" :alt="track.name" />
        <div>
          {{ track.name }} - <span>{{ track.artists.join(', ') }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  room: {
    type: Object,
    required: true,
  },
})
</script>

<style lang="scss" scoped>
@import '@/scss/components/room/room-queue.scss';
</style>
