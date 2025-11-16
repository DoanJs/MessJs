import { create } from 'zustand';
import { UserModel } from '../models';

interface MemberState {
    members: UserModel[];
    loading: boolean;
    error: string | null;
    setMembers: (members: UserModel[]) => void;
    addMember: (member: UserModel) => void;
    editMember: (id: string, member: UserModel) => void
    removeMember: (id: string) => void;
    clearMembers: () => void;
}

const useMembersStore = create<MemberState>((set) => ({
    members: [],
    loading: false,
    error: null,

    setMembers: (members: UserModel[]) => set({ members }),
    addMember: (member: UserModel) =>
        set((state: any) => ({ members: [...state.members, member] })),
    editMember: (id: string, member: UserModel) =>
        set((state: any) => {
            const index = state.members.findIndex((item: any) => item.id === id)
            state.members[index] = member
            return ({ members: [...state.members] })
        }),
    removeMember: (id: string) =>
        set((state: any) => ({
            members: state.members.filter((item: UserModel) => item.id !== id),
        })),
    clearMembers: () => set({ members: [] }),
}));

export default useMembersStore;