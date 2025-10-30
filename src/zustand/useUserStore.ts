import { create } from 'zustand';
import { UserModel } from '../models';

interface UserState {
  user: UserModel | null;
  loading: boolean;
  error: string | null;
  setUser: (user: UserModel) => void;
  clearUser: () => void;
}

const useUserStore = create<UserState>(set => ({
  user: null,
  loading: false,
  error: null,

  setUser: (user: UserModel) => set({ user }),
  clearUser: () => set({ user: null }),
}));

export default useUserStore;
