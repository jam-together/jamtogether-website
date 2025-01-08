<template>
  <template v-if="!errorMessage">
    <loading-spinner />
  </template>
  <template v-else>
    <div class="error">
      <h3>Une erreur est survenue</h3>
      <h4>{{ errorMessage }}</h4>
      <span class="link" @click="backToHome">Retour à l'accueil</span>
    </div>
  </template>
</template>

<script setup lang="ts">
import useAPIRequest from '@/composables/useAPIRequest.ts'
import { ref, watch, type Ref } from 'vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useRoute, useRouter } from 'vue-router'
import type { ISpotifyCredentials } from '@/utils/types'
import { useAuthenticationStore } from '@/stores/authentication'

const route = useRoute()

const state = ref(route.query.state as string)
const code = ref(route.query.code as string)

const errorMessage = ref<string | null>(null)

const { data: loginData, handleRequest: handleLoginRequest } = useAPIRequest<{ url: string }>({
  endpoint: '/spotify/login',
})

watch(
  loginData,
  (value) => {
    if (value?.url) {
      window.location.href = value.url
    }
  },
  { immediate: true },
)

watch(
  [state, code],
  async ([state, code]: [Ref<string>, Ref<string>]) => {
    if (!state && !code) {
      handleLoginRequest()
    } else if (state && code) {
      const { handleRequest, error } = useAPIRequest<ISpotifyCredentials>({
        endpoint: '/spotify/access-token',
        method: 'POST',
      })

      if (error.value) {
        errorMessage.value = error.value.message
      }

      const data = await handleRequest({ body: { code } })
      if (data) {
        await createRoom(data)
      }
    }
  },
  { immediate: true },
)

/* FUNCTIONS */
async function createRoom(credentials: ISpotifyCredentials) {
  const { handleRequest, error } = useAPIRequest<{
    redirectURI: string
    accessToken: string
  }>({
    endpoint: '/rooms/create',
    method: 'POST',
  })
  const data = await handleRequest({
    body: {
      token: {
        type: 'SPOTIFY',
        authorization: `${credentials.token_type} ${credentials.access_token}`,
        expiresAt: credentials?.expires_at,
        refreshToken: credentials?.refresh_token,
      },
    },
  })

  if (error.value) {
    errorMessage.value = error.value.message
  }

  if (data) {
    useAuthenticationStore().store(data?.accessToken)
    location.href = data.redirectURI
  }
}

async function backToHome() {
  useAuthenticationStore().reset() // reset token if an error happends
  await useRouter().push({ name: 'home' })
}
/* FUNCTIONS */
</script>

<style lang="scss" scoped>
div.error {
  text-align: center;
  margin: 2em 0;

  & > .link {
    display: block;
    margin: auto;
    margin-top: 0.5em;

    color: $primary;
    text-decoration: underline;
  }
}
</style>
