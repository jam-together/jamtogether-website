import type { RoomEvents } from '@/utils/types'
import { type ComputedRef } from 'vue'

interface IRoomEventsParams {
  websocket: WebSocket
  room: ComputedRef
  functions: {
    disconnect: () => Promise<void>
    setPlayed: (played: boolean) => void
  }
}

// TODO: factoriser ça ou trouver un truc sympa à faire
// TODO: ajouter des notiifcations aussi au passage etc

export default function useRoomEvents() {
  const init = ({ websocket, room, functions }: IRoomEventsParams) => {
    if (!websocket) return
    websocket.onmessage = (event: MessageEvent) => {
      const data = event.data
      if (!data) return

      const m: RoomEvents.IncomingMessage = JSON.parse(data)
      if (m.type === 'MUSIC_ADDED' || m.type === 'MUSIC_REMOVED') {
        const message = m as RoomEvents.IncomingMessage<
          RoomEvents.Music.Added | RoomEvents.Music.Removed
        >
        const track = message.data?.track
        if (!track || !room.value) return
        room.value.queue = [...room.value.queue, track]
      } else if (m.type === 'MUSIC_PAUSED') {
        functions.setPlayed(false)
      } else if (m.type === 'MUSIC_PLAYED') {
        functions.setPlayed(true)
      } else if (m.type === 'DISCONNECTED') {
        functions.disconnect()
      } else if (m.type === 'HISTORY_MODIFIED') {
        const message = m as RoomEvents.IncomingMessage<RoomEvents.IHistoryModified>
        room.value.history = message.data?.newHistory
      }

      if (m.type === 'MUSIC_PAUSED' || m.type === 'MUSIC_PLAYED' || m.type === 'MUSIC_SWITCHED') {
        const message = m as RoomEvents.IncomingMessage<
          RoomEvents.Music.Paused | RoomEvents.Music.Played | RoomEvents.Music.Switched
        >
        const newTrack = message.data?.newTrack
        const queue = message.data?.newQueue

        if (!newTrack || !queue || !room.value) return
        room.value.currentPlaying = newTrack
        room.value.queue = queue
      }

      if (m.type !== 'DISCONNECTED') {
        window.room.modal.open({
          type: 'SUCCESS',
          title: getMessageType(m.type, data),
        })
      }
    }
  }

  const getMessageType = (message: RoomEvents.MessageType, data: unknown): string => {
    if (message === 'MEMBER_JOINED' || message === 'MEMBER_LEAVED') {
      const { member } = data as RoomEvents.Member.Joined | RoomEvents.Member.Leaved
      return `${member.displayName} a ${message === 'MEMBER_JOINED' ? 'rejoint' : 'quitté'} le salon`
    } else if (message === 'MUSIC_ADDED' || message === 'MUSIC_REMOVED') {
      const { track, by } = data as RoomEvents.Music.Removed | RoomEvents.Music.Added
      return (
        `${by?.displayName} a ${message === 'MUSIC_ADDED' ? 'ajouté' : 'retiré'} la musique: ` +
        track.name
      )
    } else if (message === 'MUSIC_SWITCHED') {
      const { newTrack, by } = data as RoomEvents.Music.Switched
      return `${by?.displayName} a changé la musique par ` + newTrack.name
    } else if (message === 'MUSIC_PAUSED' || message === 'MUSIC_PLAYED') {
      const { by } = data as RoomEvents.Music.Paused | RoomEvents.Music.Played
      return (
        by?.displayName + (message === 'MUSIC_PAUSED' ? ' a mit en pause' : ' a reprit la musique')
      )
    }

    return ''
  }

  return {
    init,
    getMessageType,
  }
}
