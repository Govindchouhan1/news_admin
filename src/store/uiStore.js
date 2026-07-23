import { create } from 'zustand';

const useUiStore = create((set) => ({
  sidebarOpen: true,
  confirmModal: null,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  openConfirm: ({ title, message, onConfirm, variant = 'danger' }) =>
    set({ confirmModal: { title, message, onConfirm, variant } }),

  closeConfirm: () => set({ confirmModal: null }),
}));

export default useUiStore;
