import { create } from 'zustand';

interface BlockStore {
  blockedByMe: Record<string, true>;
  blockedMe: Record<string, true>;

  setBlockedByMe: (map: Record<string, true>) => void;
  setBlockedMe: (map: Record<string, true>) => void;

  clear: () => void;
}

const useBlockStore = create<BlockStore>(set => ({
  blockedByMe: {},
  blockedMe: {},

  setBlockedByMe: map => set({ blockedByMe: map }),
  setBlockedMe: map => set({ blockedMe: map }),

  clear: () => set({ blockedByMe: {}, blockedMe: {} }),
}));

export default useBlockStore;
