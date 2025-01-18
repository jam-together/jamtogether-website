<template>
  <template v-if="isLoading">
    <LoadingSpinner />
  </template>
  <template v-else-if="!isLoading && error">
    <div class="error-mdidle">
      <h2>Une erreur est survenue..</h2>
      <h3>{{ error instanceof Error ? error.message : error }}</h3>
      <span class="link" @click="() => backToHome()">Retour à l'accueil</span>
    </div>
  </template>
  <template v-else>
    <slot />
  </template>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useAuthenticationStore } from '@/stores/authentication'

defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
  error: {
    type: [Error, String, null],
    required: false,
  },
})

const router = useRouter()

const backToHome = async () => {
  useAuthenticationStore().reset()
  await router.push({ name: 'home' })
}
</script>

<style lang="scss" scoped>
div.error-mdidle {
  text-align: center;
  margin: 2em 0;

  & > .link {
    display: block;
    margin: auto;
    margin-top: 0.5em;
    font-size: 1.5em;

    color: $primary;
    text-decoration: underline;
  }
}
</style>
