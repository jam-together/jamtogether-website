<template>
  <loading-spinner />
</template>

<script setup lang="ts">
import useAPIRequest from '@/composables/useAPIRequest.ts'
import { ref, watch, type Ref } from 'vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useRoute } from 'vue-router'
import { type ISpotifyCredentials, useSpotifyAuth } from '@/stores/spotifyAuth.ts'
import { storeToRefs } from 'pinia'

const route = useRoute()

const state = ref(route.query.state as string)
const code = ref(route.query.code as string)

const { credentials, authorization } = storeToRefs(useSpotifyAuth())
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
      const { error, handleRequest } = useAPIRequest<ISpotifyCredentials>({
        endpoint: '/spotify/access-token',
        method: 'POST',
      })
      const response = await handleRequest({ body: { code } })
      if (!error.value) {
        useSpotifyAuth().store(response)
        await createRoom()
      } else {
        console.error(error)
      }
    }
  },
  { immediate: true },
)

async function createRoom() {
  const { handleRequest } = useAPIRequest({
    endpoint: '/rooms/create',
    method: 'POST',
  })
  const data = await handleRequest({
    body: {
      token: {
        type: 'SPOTIFY',
        authorization: authorization.value,
        expiresAt: credentials.value?.expires_at,
        refreshToken: credentials.value?.refresh_token,
      },
    },
  })
  location.href = data.redirectURI + '?client-id=' + data.clientId
}
</script>
