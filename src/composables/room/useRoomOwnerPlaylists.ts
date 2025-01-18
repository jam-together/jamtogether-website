import type { IPlaylist, TPlaylists } from '@/utils/types'
import useAPIRequest from '../useAPIRequest'
import { storeToRefs } from 'pinia'
import useConnectedRoom from '@/stores/connectedRoom'

export default function useRoomOwnerPlaylists() {
  const { room } = storeToRefs(useConnectedRoom())

  const {
    data: playlists,
    error: playlistsError,
    handleRequest: handlePlaylists,
  } = useAPIRequest<{ items: TPlaylists }>()
  const {
    data: playlist,
    error: playlistError,
    handleRequest: handlePlaylist,
  } = useAPIRequest<{ playlist: IPlaylist }>()

  const fetchPlaylists = async () => {
    try {
      await handlePlaylists({
        endpoint: '/rooms/infos/' + room.value.id + '/playlists',
      })
      if (playlistsError.value) {
        throw playlistsError.value
      }

      return playlists.value?.items
    } catch (e) {
      const error = e as Error
      window.room.modal.open({
        type: 'ERROR',
        title: "Impossible d'afficher les playlists",
        description: error.message,
      })
    }
  }

  const fetchPlaylist = async (playlistId: string) => {
    try {
      await handlePlaylist({
        endpoint: '/rooms/infos/' + room.value.id + '/playlist?playlistId=' + playlistId,
      })
      if (playlistError.value) {
        throw playlistError.value
      }

      return playlist.value?.playlist
    } catch (e) {
      const error = e as Error
      window.room.modal.open({
        type: 'ERROR',
        title: "Impossible d'afficher la playlist: " + playlistId,
        description: error.message,
      })
    }
  }

  return {
    fetchPlaylists,
    fetchPlaylist,
  }
}
