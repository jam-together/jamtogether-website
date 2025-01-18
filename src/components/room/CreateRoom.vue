<template>
  <page-state-manager :is-loading="!errorMessage" :error="errorMessage"> </page-state-manager>
</template>

<script setup lang="ts">
import useAPIRequest from '@/composables/useAPIRequest.ts'
import { ref, watch, onMounted, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import type { ISpotifyCredentials } from '@/utils/types'
import { useAuthenticationStore } from '@/stores/authentication'
import PageStateManager from '../utils/PageStateManager.vue'

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
        return
      }

      try {
        const data = await handleRequest({ body: { code } })
        if (data) {
          await createRoom(data)
        }
      } catch (e) {
        const error = e as Error
        errorMessage.value = error.stack || error.message
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

/* FUNCTIONS */
onMounted(() => useAuthenticationStore().reset())
</script>

<style lang="scss" scoped>
div.error {
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
