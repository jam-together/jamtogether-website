import useAPIRequest from '@/composables/useAPIRequest.ts'
import { ref } from 'vue'

export default function useRoomMusicPlayToggle() {
  const isMusicPlayed = ref(true)
  const { handleRequest, error } = useAPIRequest({ method: 'POST' })

  const setPlayed = (played: boolean): void => {
    isMusicPlayed.value = played
  }

  const togglePlay = async (roomId: string) => {
    try {
      await handleRequest({
        endpoint: '/rooms/actions/' + roomId + '/' + (isMusicPlayed.value ? 'pause' : 'play'),
      })

      if (error.value) {
        throw error.value
      }

      window.room.modal.open({
        type: 'SUCCESS',
        title: 'Bravo!',
        description: isMusicPlayed.value ? 'Musique reprise !' : 'Musique mit en pause',
      })
    } catch (e) {
      const error = e as Error
      window.room.modal.open({
        type: 'ERROR',
        title: "Impossible d'effectuer l'action",
        description: error.message,
      })
    }
  }

  return {
    isMusicPlayed,
    togglePlay,
    setPlayed,
  }
}
