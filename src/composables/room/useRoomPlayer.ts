import useAPIRequest from '../useAPIRequest'

type TAction = 'SKIP_NEXT' | 'SKIP_PREVIOUS' | 'ADD_TO_QUEUE'
interface IActionData {
  endpoint: string
  notification: {
    title: string
    description?: string
  }
}
const ActionMapper: { [key: string]: IActionData } = {
  SKIP_NEXT: {
    endpoint: '/skip-next',
    notification: {
      title: 'Bravo!',
      description: 'Vous venez de passer le son',
    },
  },
  SKIP_PREVIOUS: {
    endpoint: '/skip-previous',
    notification: {
      title: 'Bravo!',
      description: "Vous êtes revenu au son d'avant",
    },
  },
  ADD_TO_QUEUE: {
    endpoint: '/add-to-queue',
    notification: {
      title: 'Bravo!',
      description: "Vous avez ajouté un son dans la file d'attente",
    },
  },
}

interface IRoomPlayerParams {
  action: TAction
  body?: Record<string, unknown>
  roomId: string
}
export default function useRoomPlayer({ action, body, roomId }: IRoomPlayerParams) {
  const { isLoading, data, error, handleRequest } = useAPIRequest({
    method: 'POST',
  })

  const request = async () => {
    try {
      const { endpoint, notification } = ActionMapper[action]

      if (error.value) {
        throw error.value
      }

      await handleRequest({
        endpoint: '/rooms/actions/' + roomId + endpoint,
        ...(body && { body }),
      })
      window.room.modal.open({
        type: 'SUCCESS',
        ...notification,
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
