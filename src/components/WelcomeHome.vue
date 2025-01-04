<template>
  <div class="center">
    <h1>SpotiJam</h1>
    <h2>Le pouvoir de la musique, entre toutes les mains.</h2>

    <div class="choose">
      <router-link :to="{name: 'create-room'}">
        <button class="primary">
          Créer un salon
        </button>
      </router-link>

      <span class="or">
        <span class="line"></span>
        <span class="label">OU</span>
      </span>

      <div class="join-room">
        <input v-model="roomId" type="text" placeholder="Code du salon (ex: R-A8R2D6P0N9R2)" />
        <template v-if="!!roomId.trim()">
          <router-link :to="{name: 'room', params: {id: roomId}}">
            <button :disabled="!roomId.trim()" class="primary icon">
            </button>
          </router-link>
        </template>
        <template v-else>
          <button class="primary icon" disabled>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const roomId = ref<string>("");
</script>

<style scoped>
@import "@/scss/components/welcome-home.scss";
</style>
