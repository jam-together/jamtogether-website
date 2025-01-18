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
  history: RoomEvents.IncomingMessage[]
}

export interface IPlayer {
  isPlaying: boolean
  deviceName: string
}

export interface IPlaylist {
  id: string
  name: string
  image: string
  description: string
  public: boolean
  tracks: ITrack[]
}

export type TPlaylists = Pick<IPlaylist, 'id' | 'name' | 'image' | 'description' | 'public'>[]

export interface IRoomMember {
  id: string
  displayName: string
  isConnected: boolean
}

export declare namespace RoomEvents {
  interface IHistoryModified {
    newHistory: RoomEvents.IncomingMessage[]
  }

  interface INewDevice {
    deviceName: string
  }

  namespace Member {
    interface Joined {
      member: IRoomMember
    }
    interface Leaved {
      member: IRoomMember
    }

    interface Nickname {
      member: IRoomMember
    }

    type MessageType = 'MEMBER_JOINED' | 'MEMBER_LEAVED'
  }
  namespace Music {
    interface Added {
      newTrack: ITrack
      newQueue: Array<ITrack>
      by?: IRoomMember
    }
    interface Removed {
      newTrack: ITrack
      newQueue: Array<ITrack>
      by?: IRoomMember
    }
    interface Switched {
      newTrack: ITrack
      newQueue: Array<ITrack>
      by?: IRoomMember
    }
    interface Played {
      newTrack: ITrack
      newQueue: Array<ITrack>
      by?: IRoomMember
    }
    interface Paused {
      newTrack: ITrack
      newQueue: Array<ITrack>
      by?: IRoomMember
    }

    type MessageType =
      | 'MUSIC_ADDED'
      | 'MUSIC_REMOVED'
      | 'MUSIC_SWITCHED'
      | 'MUSIC_PLAYED'
      | 'MUSIC_PAUSED'
  }

  type MessageType =
    | Music.MessageType
    | Member.MessageType
    | 'DISCONNECTED'
    | 'HISTORY_MODIFIED'
    | 'NEW_DEVICE'
    | 'NICKNAME_CHANGED'
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
