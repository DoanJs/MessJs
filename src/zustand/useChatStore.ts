import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MessageModel } from '../models';

interface ChatState {
  messagesByRoom: Record<string, MessageModel[]>; // realtime messages (not persisted)
  pendingMessages: Record<string, MessageModel[]>; // stored offline

  // Set messages for a room (from Firestore)
  setMessagesForRoom: (roomId: string, messages: MessageModel[]) => void;

  // Add local pending message (sending/failed)
  addPendingMessage: (roomId: string, message: MessageModel) => void;

  // Remove pending message after success
  removePendingMessage: (roomId: string, tempId: string) => void;

  // Update local message status (sending -> sent/failed)
  updatePendingStatus: (
    roomId: string,
    id: string,
    status: 'sent' | 'failed',
  ) => void;

  clearAll: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messagesByRoom: {},
      pendingMessages: {},

      setMessagesForRoom: (roomId, messages) => {
        set(state => {
          const prevMessages = state.messagesByRoom[roomId] || [];

          // ⚡ 1️⃣ Tạo Set để kiểm tra trùng nhanh
          const existingIds = new Set(prevMessages.map(m => m.id));

          // ⚡ 2️⃣ Chỉ lấy tin nhắn mới chưa có
          const uniqueNewMsgs = messages.filter(m => !existingIds.has(m.id));

          // ⚡ 3️⃣ Ghép lại mảng
          const allMessages = [...prevMessages, ...uniqueNewMsgs];

          // ⚡ 4️⃣ Sắp xếp theo thời gian
          allMessages.sort((a: any, b: any) => {
            const aTime =
              typeof a.createdAt === 'object' && a.createdAt?.toMillis
                ? a.createdAt.toMillis()
                : Number(a.createdAt);
            const bTime =
              typeof b.createdAt === 'object' && b.createdAt?.toMillis
                ? b.createdAt.toMillis()
                : Number(b.createdAt);
            return aTime - bTime;
          });

          return {
            messagesByRoom: {
              ...state.messagesByRoom,
              [roomId]: allMessages,
            },
          };
        });

        // Khi Firestore có tin nhắn mới → xoá các pending trùng ID
        const pending = get().pendingMessages[roomId] || [];
        const filteredPending = pending.filter(
          p => !messages.some(m => m.id === p.id),
        );
        set(state => ({
          pendingMessages: {
            ...state.pendingMessages,
            [roomId]: filteredPending,
          },
        }));
      },

      addPendingMessage: (roomId, message) => {
        set(state => ({
          pendingMessages: {
            ...state.pendingMessages,
            [roomId]: [...(state.pendingMessages[roomId] || []), message],
          },
        }));
      },

      removePendingMessage: (roomId, tempId) => {
        set(state => ({
          pendingMessages: {
            ...state.pendingMessages,
            [roomId]: (state.pendingMessages[roomId] || []).filter(
              m => m.id !== tempId,
            ),
          },
        }));
      },

      updatePendingStatus: (roomId, id, status) => {
        set(state => ({
          pendingMessages: {
            ...state.pendingMessages,
            [roomId]: (state.pendingMessages[roomId] || []).map(m =>
              m.id === id ? { ...m, status } : m,
            ),
          },
        }));
      },

      clearAll: () => set({ messagesByRoom: {}, pendingMessages: {} }),
    }),
    {
      name: 'chat-persist',
      partialize: state => ({ pendingMessages: state.pendingMessages }), // chỉ persist pending
      storage: createJSONStorage(() => AsyncStorage), // 👈 thêm dòng này
    },
  ),
);
