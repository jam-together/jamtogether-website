import useConnectedRoom from '@/stores/connectedRoom'
import { useWebsocketStore } from '@/stores/websocket'
import type { IRoom, RoomEvents } from '@/utils/types'
import { storeToRefs } from 'pinia'

export default function useRoomEvents() {
  const { websocket } = storeToRefs(useWebsocketStore())
  const { room } = storeToRefs(useConnectedRoom())
  const init = () => {
    if (!websocket) return
    websocket.value!.onmessage = (event: MessageEvent) => {
      const data = event.data
      if (!data || data === '__pong__') return

      const m: RoomEvents.IncomingMessage = JSON.parse(data)

      if (m.type === 'MUSIC_ADDED' || m.type === 'MUSIC_REMOVED') {
        const message = m as RoomEvents.IncomingMessage<
          RoomEvents.Music.Added | RoomEvents.Music.Removed
        >
        const newQueue = message.data?.newQueue
        if (!newQueue || !room.value) return

        room.value.queue = newQueue
      } else if (m.type === 'MUSIC_PAUSED') {
        useConnectedRoom().setPlayed(false)
      } else if (m.type === 'MUSIC_PLAYED') {
        useConnectedRoom().setPlayed(true)
      }
      if (m.type === 'HISTORY_MODIFIED') {
        const message = m as RoomEvents.IncomingMessage<RoomEvents.IHistoryModified>
        room.value.history = message.data?.newHistory as IRoom['history']
      } else if (m.type === 'MEMBER_JOINED' || m.type === 'MEMBER_LEAVED') {
        const { member } = m.data as RoomEvents.Member.Joined
        const memberIndex = room.value.members.findIndex(({ id }) => id === member.id)
        if (memberIndex === -1) {
          room.value.members.push(member)
        } else {
          room.value.members[memberIndex] = member
        }
      } else if (m.type === 'NEW_DEVICE') {
        const { deviceName } = m.data as RoomEvents.INewDevice
        room.value.player.deviceName = deviceName
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
        const title = getMessageType(m.type, m.data)
        if (!!title?.trim()) {
          window.room.modal.open({ type: 'SUCCESS', title })
        }
      }
    }
  }

  const getMessageType = (message: RoomEvents.MessageType, data: unknown): string => {
    if (!data) return ''

    if (message === 'MEMBER_JOINED' || message === 'MEMBER_LEAVED') {
      const { member } = data as RoomEvents.Member.Joined | RoomEvents.Member.Leaved
      if (!member?.displayName) return ''
      return `${member.displayName} a ${message === 'MEMBER_JOINED' ? 'rejoint' : 'quitté'} le salon`
    } else if (message === 'MUSIC_ADDED' || message === 'MUSIC_REMOVED') {
      const { newTrack, by } = data as RoomEvents.Music.Removed | RoomEvents.Music.Added
      if (!by?.displayName) return ''
      return (
        `${by?.displayName} a ${message === 'MUSIC_ADDED' ? 'ajouté' : 'retiré'} la musique: ` +
        newTrack.name
      )
    } else if (message === 'MUSIC_SWITCHED') {
      const { newTrack, by } = data as RoomEvents.Music.Switched
      if (!by?.displayName) return ''
      return `${by?.displayName} a changé la musique par ` + newTrack.name
    } else if (message === 'MUSIC_PAUSED' || message === 'MUSIC_PLAYED') {
      const { by } = data as RoomEvents.Music.Paused | RoomEvents.Music.Played
      if (!by?.displayName) return ''
      return (
        by?.displayName +
        ' a ' +
        (message === 'MUSIC_PAUSED' ? ' reprit la musique' : 'mit en pause')
      )
    }

    return ''
  }

  return {
    init,
    getMessageType,
  }
}
