import { create } from 'zustand';
import { FriendShipModel } from '../models';

interface FriendShipState {
  friendShips: FriendShipModel;
  loading: boolean;
  error: string | null;

  setFriendShips: (update: FriendShipModel | ((prev: FriendShipModel) => FriendShipModel)) => void;
  setFriendShip: (roomId: string, count: number) => void;
  clearFriendShip: (roomId: string) => void;
  clearAllFriendShips: () => void;
}

const useFriendShipStore = create<FriendShipState>(set => ({
  friendShips: {},
  loading: false,
  error: null,

  setFriendShips: update =>
    set(state => ({
      friendShips: typeof update === 'function' ? update(state.friendShips) : update,
    })),

  setFriendShip: (roomId, count) =>
    set(state => ({
      friendShips: {
        ...state.friendShips,
        [roomId]: count,
      },
    })),

  clearFriendShip: roomId =>
    set(state => {
      const updated = { ...state.friendShips };
      delete updated[roomId];
      return { friendShips: updated };
    }),

  clearAllFriendShips: () => set({ friendShips: {} }),
}));

export default useFriendShipStore;
