import { create } from 'zustand';

interface MessageState {
  messages: any;
  loading: boolean;
  error: string | null;
  setMessages: (messages: any) => void;
  addMessage: (message: any) => void;
  editMessage: (id: string, message: any) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
}

const useMessageStore = create<MessageState>(set => ({
  messages: [],
  loading: false,
  error: null,

  setMessages: (messages: any) => set({ messages }),
  addMessage: (message: any) =>
    set((state: any) => ({ messages: [...state.messages, message] })),
  editMessage: (id: string, message: any) =>
    set((state: any) => {
      const index = state.messages.findIndex((item: any) => item.id === id);
      state.messages[index] = message;
      return { messages: [...state.messages] };
    }),
  removeMessage: (id: string) =>
    set((state: any) => ({
      messages: state.messages.filter((item: any) => item.id !== id),
    })),
  clearMessages: () => set({ messages: [] }),
}));

export default useMessageStore;
