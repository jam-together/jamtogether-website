import type { IRoom } from '@/utils/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const unkownRoom: IRoom = {
  history: [],
  createdAt: new Date(),
  currentPlaying: {
    artists: [],
    id: '0000-0000-0000-0000',
    image: '',
    name: '',
  },
  members: [],
  ownerId: '0000-0000-0000-0000',
  player: { deviceName: 'Unknown', isPlaying: false },
  queue: [],
  id: '0000-0000-0000-0000',
}

const useConnectedRoom = defineStore('connectedRoom', () => {
  const _data = ref<IRoom | null>(null)
  const room = computed<IRoom>({
    get: () => _data.value! ?? unkownRoom,
    set: (value: IRoom) => {
      if (!_data.value) return
      _data.value = { ..._data.value, ...value }
    },
  })
  const isMusicPlayed = ref<boolean>(false)

  const init = (data: IRoom) => {
    _data.value = data
  }

  const setPlayed = (isPlayed: boolean) => {
    isMusicPlayed.value = isPlayed
  }

  return {
    room,
    setPlayed,
    isMusicPlayed,
    init,
  }
})

export default useConnectedRoom
