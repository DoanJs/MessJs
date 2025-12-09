import { create } from 'zustand';
import { UserModel } from '../models';

interface FriendShipState {
  friendShips: UserModel[];
  loading: boolean;
  error: string | null;
  setFriendShips: (friendShips: UserModel[]) => void;
  addFriendShip: (friendShip: UserModel) => void;
  editFriendShip: (id: string, friendShip: UserModel) => void;
  removeFriendShip: (id: string) => void;
  clearFriendShips: () => void;
}

const useFriendShipStore = create<FriendShipState>(set => ({
  friendShips: [],
  loading: false,
  error: null,

  setFriendShips: (friendShips: UserModel[]) => set({ friendShips }),
  addFriendShip: (friendShip: UserModel) =>
    set((state: any) => ({ friendShips: [...state.friendShips, friendShip] })),
  editFriendShip: (id: string, friendShip: UserModel) =>
    set((state: any) => {
      const index = state.friendShips.findIndex((item: any) => item.id === id);
      state.friendShips[index] = friendShip;
      return { friendShips: [...state.friendShips] };
    }),
  removeFriendShip: (id: string) =>
    set((state: any) => ({
      friendShips: state.friendShips.filter(
        (item: UserModel) => item.id !== id,
      ),
    })),
  clearFriendShips: () => set({ friendShips: [] }),
}));

export default useFriendShipStore;
