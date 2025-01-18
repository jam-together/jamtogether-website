import type { IRoomMember } from '@/utils/types'
import { jwtDecode } from 'jwt-decode'
import { defineStore } from 'pinia'
import { computed } from 'vue'

interface IMe {
  clientId: string
  roomId: string
  roles: string[]
  member: IRoomMember
}

export const useAuthenticationStore = defineStore('authentication', () => {
  const accessToken = computed<string | null>(() => {
    return localStorage.getItem('access_token')
  })
  const authorization = computed<string | null>(() => {
    return accessToken.value ? `Bearer ${accessToken.value}` : null
  })

  const me = computed<IMe | null>(() => {
    if (!accessToken.value) return null
    return unserialize(accessToken.value!)
  })

  const unserialize = (token: string): IMe | null => {
    try {
      const decoded = jwtDecode(token)
      return decoded as IMe
    } catch (e) {
      console.error(e)
      reset()
    }
    return null
  }

  const reset = (): void => {
    localStorage.removeItem('access_token')
  }

  const store = (accessToken: string): void => {
    const decoded = unserialize(accessToken)
    if (!decoded || !me.value || (decoded && me.value && decoded!.roomId !== me.value?.roomId)) {
      localStorage.setItem('access_token', accessToken)
    }
  }

  return {
    store,
    authorization,
    reset,
    unserialize,
    me,
  }
})
