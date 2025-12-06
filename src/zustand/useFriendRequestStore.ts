import { create } from 'zustand';
import { FriendRequestModel } from '../models';

interface FriendRequestState {
    friendRequests: FriendRequestModel[];
    loading: boolean;
    error: string | null;
    setFriendRequests: (friendRequests: FriendRequestModel[]) => void;
    addFriendRequest: (friendRequest: FriendRequestModel) => void;
    editFriendRequest: (id: string, friendRequest: FriendRequestModel) => void
    removeFriendRequest: (id: string) => void;
    clearFriendRequests: () => void;
}

const useFriendRequestStore = create<FriendRequestState>((set) => ({
    friendRequests: [],
    loading: false,
    error: null,

    setFriendRequests: (friendRequests: FriendRequestModel[]) => set({ friendRequests }),
    addFriendRequest: (friendRequest: FriendRequestModel) =>
        set((state: any) => ({ friendRequests: [...state.friendRequests, friendRequest] })),
    editFriendRequest: (id: string, friendRequest: FriendRequestModel) =>
        set((state: any) => {
            const index = state.friendRequests.findIndex((item: any) => item.id === id)
            state.friendRequests[index] = friendRequest
            return ({ friendRequests: [...state.friendRequests] })
        }),
    removeFriendRequest: (id: string) =>
        set((state: any) => ({
            friendRequests: state.friendRequests.filter((item: FriendRequestModel) => item.id !== id),
        })),
    clearFriendRequests: () => set({ friendRequests: [] }),
}));

export default useFriendRequestStore;