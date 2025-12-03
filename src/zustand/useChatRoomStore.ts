import { create } from 'zustand';
import { ChatRoomModel } from '../models';

interface ChatRoomState {
    chatRooms: ChatRoomModel[];
    loading: boolean;
    error: string | null;
    setChatRooms: (chatRooms: ChatRoomModel[]) => void;
    addChatRoom: (chatRoom: ChatRoomModel) => void;
    editChatRoom: (id: string, chatRoom: ChatRoomModel) => void
    removeChatRoom: (id: string) => void;
    clearChatRooms: () => void;
}

const useChatRoomStore = create<ChatRoomState>((set) => ({
    chatRooms: [],
    loading: false,
    error: null,

    setChatRooms: (chatRooms: ChatRoomModel[]) => set({ chatRooms }),
    addChatRoom: (chatRoom: ChatRoomModel) =>
        set((state: any) => ({ chatRooms: [...state.chatRooms, chatRoom] })),
    editChatRoom: (id: string, chatRoom: ChatRoomModel) =>
        set((state: any) => {
            const index = state.chatRooms.findIndex((item: any) => item.id === id)
            state.chatRooms[index] = chatRoom
            return ({ chatRooms: [...state.chatRooms] })
        }),
    removeChatRoom: (id: string) =>
        set((state: any) => ({
            chatRooms: state.chatRooms.filter((item: ChatRoomModel) => item.id !== id),
        })),
    clearChatRooms: () => set({ chatRooms: [] }),
}));

export default useChatRoomStore;