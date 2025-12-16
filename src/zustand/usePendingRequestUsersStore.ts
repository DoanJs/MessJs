import { UserModel } from "../models";
import { create } from 'zustand';

type PendingType = 'pending_in' | 'pending_out';

interface PendingRequestUser {
  id: string;
  user: UserModel;
}

interface PendingRequestUserStore {
  users: Record<string, UserModel>;

  setUsers: (users: Record<string, UserModel>) => void;
  clear: () => void;
}


const usePendingRequestUsersStore =
  create<PendingRequestUserStore>(set => ({
    users: {},

    setUsers: users => set({ users }),

    clear: () => set({ users: {} }),
  }));

export default usePendingRequestUsersStore;
