<template>
  <loading-spinner />
</template>

<script setup lang="ts">
import useAPIRequest from '@/composables/useAPIRequest.ts'
import { ref, watch } from 'vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useRoute } from 'vue-router'
import { type ISpotifyCredentials, useSpotifyAuth } from '@/stores/spotifyAuth.ts'
import { storeToRefs } from 'pinia'

const route = useRoute()

const state = ref(route.query.state)
const code = ref(route.query.code)

const { credentials, authorization } = storeToRefs(useSpotifyAuth())
const { data, handleRequest } = useAPIRequest<{ url: string }>({
  endpoint: '/spotify/login',
})

watch(
  data,
  (value) => {
    if (value?.url) {
      window.location.href = value.url
    }
  },
  { immediate: true },
)

watch(
  credentials,
  async () => {
    await createRoom()
  },
  { immediate: true },
)

watch(
  [state, code],
  async ([state, code]: any) => {
    if (state && code) {
      const { error, handleRequest } = useAPIRequest<ISpotifyCredentials>({
        endpoint: '/spotify/access-token',
        method: 'POST',
      })
      const response = await handleRequest({ body: { code } })
      if (!error.value) {
        useSpotifyAuth().store(response)
      } else {
        console.error(error)
      }
    } else if ( !state && !code) {
      handleRequest()
    }

    if (state && code) {
      createRoom()
    }
  },
  { immediate: true },
)

async function createRoom() {
  const { handleRequest, error } = useAPIRequest({
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

  if (!error.value) {
    location.href = data.redirectURI + '?client-id=' + data.clientId
  } else {
    window.location.reload()
  }
}
</script>
