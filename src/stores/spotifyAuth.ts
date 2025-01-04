import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import useAPIRequest from '@/composables/useAPIRequest.ts'

export interface ISpotifyCredentials {
  access_token: string
  refresh_token: string
  scope: string
  expires_at: number
  expires_in: number
  token_type: string
}

export const useSpotifyAuth = defineStore('spotifyAuth', () => {
  const credentials = computed<ISpotifyCredentials | null>(() => {
    const stringifyCredentials = localStorage.getItem('spotify_credentials')
    return stringifyCredentials && stringifyCredentials !== 'undefined'
      ? JSON.parse(stringifyCredentials)
      : null
  })

  const hasExpired = computed<boolean>(() => {
    if (!credentials.value) return true
    return Date.now() > credentials.value.expires_at;
  })

  const authorization = computed(() => {
    return credentials.value
      ? `${credentials.value.token_type} ${credentials.value.access_token}`
      : null
  })

  watch(
    hasExpired,
    async (val) => {
      if (val) {
        await _refreshToken()
      }
    },
    { immediate: true },
  )

  function store(credentials: ISpotifyCredentials) {
    const referenceTimestamp = Date.now()
    credentials.expires_at = referenceTimestamp + credentials.expires_in * 1000

    localStorage.setItem('spotify_credentials', JSON.stringify(credentials))
  }

  async function _refreshToken() {
    if (!credentials.value) return
    const { refresh_token } = credentials.value
    const { error, handleRequest } = useAPIRequest<ISpotifyCredentials>({
      method: 'POST',
      endpoint: '/spotify/refresh-token',
    })
    const data = await handleRequest({
      body: {
        refreshToken: refresh_token,
      },
    })

    if (error.value) {
      localStorage.removeItem('spotify_credentials');
      console.error(error.value.message);
      return;
    }

    store(data);
  }

  return {
    store,
    hasExpired,
    credentials,
    authorization,
  }
})
