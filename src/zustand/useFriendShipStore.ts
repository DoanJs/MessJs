import { create } from 'zustand';
import { UserModel } from '../models';

interface FriendShipStore {
  friendShips: Record<string, true>;
  friendList: UserModel[];

  setFriendShips: (map: Record<string, true>) => void;
  setFriendList: (list: UserModel[]) => void;

  clear: () => void;
}

const useFriendShipStore = create<FriendShipStore>(set => ({
  friendShips: {},
  friendList: [],

  setFriendShips: map => set({ friendShips: map }),
  setFriendList: list => set({ friendList: list }),

  clear: () => set({ friendShips: {}, friendList: [] }),
}));

export default useFriendShipStore;
