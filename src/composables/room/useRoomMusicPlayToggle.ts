import useAPIRequest from '@/composables/useAPIRequest.ts'
import useConnectedRoom from '@/stores/connectedRoom'
import { storeToRefs } from 'pinia'

export default function useRoomMusicPlayToggle() {
  const { isMusicPlayed } = storeToRefs(useConnectedRoom())
  const { handleRequest, error } = useAPIRequest({ method: 'POST' })

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
        description: !isMusicPlayed.value ? 'Musique reprise !' : 'Musique mit en pause',
      })
      useConnectedRoom().setPlayed(!isMusicPlayed.value)
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
    togglePlay,
  }
}
