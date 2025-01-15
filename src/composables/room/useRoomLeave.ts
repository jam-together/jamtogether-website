import useAPIRequest from '../useAPIRequest'

export default function useRoomLeave() {
  const { isLoading, data, error, handleRequest } = useAPIRequest({
    method: 'POST',
  })

  const request = async () => {
    try {
      await handleRequest({
        endpoint: '/rooms/leave',
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
    request,
    isLoading,
    error,
    data,
  }
}
