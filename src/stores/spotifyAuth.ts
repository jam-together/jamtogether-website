import { defineStore } from 'pinia'
import { computed } from 'vue'

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
    return Date.now() > credentials.value.expires_at
  })

  const authorization = computed(() => {
    return credentials.value
      ? `${credentials.value.token_type} ${credentials.value.access_token}`
      : null
  })

  function store(credentials: ISpotifyCredentials) {
    const referenceTimestamp = Date.now()
    credentials.expires_at = referenceTimestamp + credentials.expires_in * 1000

    localStorage.setItem('spotify_credentials', JSON.stringify(credentials))
  }

  return {
    store,
    hasExpired,
    credentials,
    authorization,
  }
})
