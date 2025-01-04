import useAPIRequest from '@/composables/useAPIRequest.ts'

export default function useRoomSkipPrevious() {

  const {isLoading, data, error, handleRequest} = useAPIRequest({
    method: "POST"
  });

  const request = async (roomId: string) => {
    await handleRequest({
      endpoint: "/rooms/actions/"+roomId+"/skip-previous"
    });
  }

  return {
    request,
    isLoading,
    error,
    data
  }

}
