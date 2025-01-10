import { jwtDecode } from 'jwt-decode'
import { defineStore } from 'pinia'
import { computed } from 'vue'

interface IMe {
  clientId: string
  roomId: string
  roles: string[]
}

export const useAuthenticationStore = defineStore('authentication', () => {
  const accessToken = computed<string | null>(() => {
    return localStorage.getItem('access_token')
  })
  const authorization = computed<string | null>(() => {
    return accessToken.value ? `Bearer ${accessToken.value}` : null
  })

  const me = computed<IMe | null>(() => {
    try {
      const decoded = jwtDecode(accessToken.value!)
      return decoded as IMe
    } catch (e) {
      console.error(e)
      reset()
    }
    return null
  })

  function reset(): void {
    localStorage.removeItem('access_token')
  }

  function store(accessToken: string) {
    localStorage.setItem('access_token', accessToken)
  }

  return {
    store,
    authorization,
    reset,
    me,
  }
})
