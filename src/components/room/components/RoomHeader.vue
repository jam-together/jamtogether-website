<template>
  <header>
    <div class="actions">
      <button @click="emit('showHistory')" class="icon history" />
      <button @click="emit('showMembers')" class="icon members" />
    </div>

    <button @click="() => disconnect()" class="disconnect icon">
      {{ $t('room.components.header.leaveRoom') }}
    </button>
    <h3 class="room-id">
      CODE <span class="icon copy" @click="copyToClipboard">{{ room.id }}</span>
      <button class="icon share" @click="share" />
    </h3>
    <h4 v-show="room.player?.deviceName" class="connected-to">
      {{ $t('room.components.header.connectedTo', [room.player?.deviceName]) }}
    </h4>

    <room-searchbar :room-id="room.id" />
  </header>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import RoomSearchbar from './RoomSearchbar.vue'
import useConnectedRoom from '@/stores/connectedRoom'

const { room } = storeToRefs(useConnectedRoom())

defineProps({
  disconnect: {
    type: Function,
    required: true,
  },
})

const copyToClipboard = async () => {
  await navigator.clipboard.writeText(room.value.id)
  window.room.modal.open({
    title: 'Bravo',
    description: 'Code de la salle bien copié',
    type: 'SUCCESS',
  })
}

const share = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Jamtogether',
        text: `Rejoint mon salon en cliquant sur le lien au dessus !`,
        url: window.location.href,
      })
    } catch (_) {}
  } else {
    window.room.modal.open({
      title: 'Oups..',
      type: 'ERROR',
      description: 'Votre navigateur ne prend pas en charge cette fonctionnalité.',
    })
  }
}

const emit = defineEmits(['showHistory', 'showMembers'])
</script>

<style lang="scss">
@import '@/scss/components/room/room-header.scss';
</style>
