export interface ITrack {
  id: string
  name: string
  artists: Array<string>
  image: string
}

export interface IRoom {
  id: string
  ownerId: string
  createdAt: Date
  queue: Array<ITrack>
  members: Array<IRoomMember>
  currentPlaying: ITrack
  player: IPlayer
}

export interface IPlayer {
  isPlaying: boolean
  deviceName: string
}

export interface IRoomMember {
  id: string
  displayName: string
}

export declare namespace RoomEvents {
  namespace Member {
    interface Joined {
      member: IRoomMember
    }
    interface Leaved {
      member: IRoomMember
    }

    type MessageType = 'MEMBER_JOINED' | 'MEMBER_LEAVED'
  }
  namespace Music {
    interface Added {
      track: ITrack
    }
    interface Removed {
      track: ITrack
    }
    interface Switched {
      newTrack: ITrack
      newQueue: Array<ITrack>
    }
    interface Played {
      newTrack: ITrack
      newQueue: Array<ITrack>
    }
    interface Paused {
      newTrack: ITrack
      newQueue: Array<ITrack>
    }

    type MessageType =
      | 'MUSIC_ADDED'
      | 'MUSIC_REMOVED'
      | 'MUSIC_SWITCHED'
      | 'MUSIC_PLAYED'
      | 'MUSIC_PAUSED'
  }

  type MessageType = Music.MessageType | Member.MessageType | 'DISCONNECTED'
  interface IncomingMessage<T = {}> {
    date: Date
    type: RoomEvents.MessageType
    data?: T
  }
}

export interface ISpotifyCredentials {
  access_token: string
  refresh_token: string
  scope: string
  expires_at: number
  expires_in: number
  token_type: string
}
