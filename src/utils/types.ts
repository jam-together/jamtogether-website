export interface ITrack {
  id: string;
  name: string;
  artists: Array<string>;
  image: string;
}

export interface IRoom {
  id: string;
  ownerId: string;
  createdAt: Date;
  queue: Array<ITrack>;
  members: Array<{
    id: string;
    displayName: string;
  }>;
  currentPlaying: ITrack;
}
