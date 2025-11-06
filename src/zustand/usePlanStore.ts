import { create } from 'zustand';
import { UserModel } from '../models';

interface UserState {
    users: UserModel[];
    loading: boolean;
    error: string | null;
    setUsers: (users: UserModel[]) => void;
    addUser: (user: UserModel) => void;
    editUser: (id: string, user: UserModel) => void
    removeUser: (id: string) => void;
    clearUsers: () => void;
}

const useUsersStore = create<UserState>((set) => ({
    users: [],
    loading: false,
    error: null,

    setUsers: (users: UserModel[]) => set({ users }),
    addUser: (user: UserModel) =>
        set((state: any) => ({ users: [...state.users, user] })),
    editUser: (id: string, user: UserModel) =>
        set((state: any) => {
            const index = state.users.findIndex((item: any) => item.id === id)
            state.users[index] = user
            return ({ users: [...state.users] })
        }),
    removeUser: (id: string) =>
        set((state: any) => ({
            users: state.users.filter((item: UserModel) => item.id !== id),
        })),
    clearUsers: () => set({ users: [] }),
}));

export default useUsersStore;