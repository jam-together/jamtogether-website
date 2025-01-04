import useAPIRequest from '@/composables/useAPIRequest.ts'
import type { ITrack } from '@/utils/types.ts'

export default function useRoomSongRequest() {

  const {isLoading, data, error, handleRequest} = useAPIRequest({
    method: "POST"
  });

  const request = async (roomId: string, track: ITrack) => {
    await handleRequest({
      endpoint: "/rooms/actions/"+roomId+"/add-to-queue",
      body: { track }
    });
  }

  return {
    request,
    isLoading,
    error,
    data
  }

}
