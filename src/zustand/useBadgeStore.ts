import { create } from 'zustand';
import { BadgeModel } from '../models';

interface BadgeState {
  badges: BadgeModel;
  loading: boolean;
  error: string | null;

  //   setBadges: (badges: BadgeModel) => void;
  setBadges: (update: BadgeModel | ((prev: BadgeModel) => BadgeModel)) => void;
//   updateBadge: (roomId: string, count: number) => void;
  setBadge: (roomId: string, count: number) => void;
  incrementBadge: (roomId: string) => void;
  clearBadge: (roomId: string) => void;
  clearAllBadges: () => void;
}

const useBadgeStore = create<BadgeState>(set => ({
  badges: {},
  loading: false,
  error: null,

  //   setBadges: badges => set({ badges }),
  setBadges: update =>
    set(state => ({
      badges: typeof update === 'function' ? update(state.badges) : update,
    })),

//   updateBadge: (roomId: string, count: number) =>
//     set(state => ({
//       badges: {
//         ...state.badges,
//         [roomId]: count,
//       },
//     })),

  setBadge: (roomId, count) =>
    set(state => ({
      badges: {
        ...state.badges,
        [roomId]: count,
      },
    })),

  incrementBadge: roomId =>
    set(state => ({
      badges: {
        ...state.badges,
        [roomId]: (state.badges[roomId] || 0) + 1,
      },
    })),

  clearBadge: roomId =>
    set(state => {
      const updated = { ...state.badges };
      delete updated[roomId];
      return { badges: updated };
    }),

  clearAllBadges: () => set({ badges: {} }),
}));

export default useBadgeStore;
