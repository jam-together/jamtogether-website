<template>
  <div class="center">
    <h1>JamTogether</h1>
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
        <div class="code-input">
          <input
            v-for="(_, index) in code"
            :key="index"
            type="text"
            maxlength="1"
            v-model="code[index]"
            @input="onInput(index, $event)"
            @keydown.backspace="onBackspace(index, $event)"
            ref="inputRefs"
          />
        </div>
        <button @click="joinRoom" class="primary icon" :disabled="isDisabled">Rejoindre</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const code = ref(Array(6).fill(''))
const inputRefs = ref<HTMLInputElement[]>([])
const isDisabled = computed(() => code.value.filter((c) => !c.trim()).length > 0)

const onInput = (index: number, event: Event) => {
  let value = (event.target! as HTMLInputElement).value
  const [first, ...rest] = value
  value = first ?? ''

  const lastInputBox = index === inputRefs.value.length - 1
  const didInsertContent = first !== undefined

  if (didInsertContent && !lastInputBox) {
    inputRefs.value[index + 1].focus()
    inputRefs.value[index + 1].value = rest.join('')
    inputRefs.value[index + 1].dispatchEvent(new Event('input'))
  }
}

const onBackspace = (index: number, event: Event) => {
  const value = (event.target! as HTMLInputElement).value
  if (value === '') {
    inputRefs.value[Math.max(0, index - 1)]?.focus()
  }
}

const joinRoom = async () => {
  if (isDisabled.value) return
  const roomId = code.value.join('').trim().toUpperCase()

  await router.push({
    name: 'room',
    params: { id: roomId },
  })
}
</script>

<style scoped>
@import '@/scss/components/welcome-home.scss';
</style>
