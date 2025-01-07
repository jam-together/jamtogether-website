<template>
  <div class="center">
    <h1>SpotiJam</h1>
    <h2>Le pouvoir de la musique, entre toutes les mains.</h2>

    <div class="choose">
      <router-link :to="{ name: 'create-room' }">
        <button class="primary">Créer un salon</button>
      </router-link>

      <span class="or">
        <span class="line"></span>
        <span class="label">OU</span>
      </span>

      <div class="join-room">
        <input v-model="roomId" type="text" placeholder="Code du salon (ex: A8R2D6)" />
        <button @click="joinRoom" class="primary icon" :disabled="!roomId.trim()" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const roomId = ref<string>('')
const router = useRouter()

const joinRoom = async () => {
  if (!roomId.value.trim()) {
    return
  }
  await router.push({
    name: 'room',
    params: { id: roomId.value },
  })
}
</script>

<style scoped>
@import '@/scss/components/welcome-home.scss';
</style>
