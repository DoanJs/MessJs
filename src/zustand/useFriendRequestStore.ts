import { create } from 'zustand';

type PendingType = 'pending_in' | 'pending_out';

interface FriendRequestStore {
  friendRequests: Record<string, PendingType>;
  setFriendRequests: (map: Record<string, PendingType>) => void;
  clear: () => void;
}

const useFriendRequestStore = create<FriendRequestStore>(set => ({
  friendRequests: {},

  setFriendRequests: map => set({ friendRequests: map }),

  clear: () => set({ friendRequests: {} }),
}));
export default useFriendRequestStore;
