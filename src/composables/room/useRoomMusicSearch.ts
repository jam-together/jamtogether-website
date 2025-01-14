import useAPIRequest from '@/composables/useAPIRequest.ts'
import type { ITrack } from '@/utils/types.ts'
import { computed } from 'vue'

export default function useRoomMusicSearch() {
  const { isLoading, data, error, handleRequest, reset } = useAPIRequest<{
    items: Array<ITrack>
  }>()

  const search = async (roomId: string, query: string) => {
    try {
      await handleRequest({
        endpoint: '/rooms/actions/' + roomId + '/search?q=' + encodeURIComponent(query),
      })

      if (error.value) {
        throw error.value
      }
    } catch (e) {
      const error = e as Error
      window.room.modal.open({
        type: 'ERROR',
        title: 'Impossible de rechercher',
        description: error.message,
      })
    }
  }

  return {
    search,
    isLoading,
    reset,
    error,
    items: computed<ITrack[]>(() => data?.value?.items ?? []),
  }
}
