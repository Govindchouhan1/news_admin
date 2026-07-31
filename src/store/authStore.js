import { create } from 'zustand';

// Access token stored in sessionStorage (survives component remounts, cleared on tab close)
export const getAccessToken = () => sessionStorage.getItem('accessToken');
export const setAccessToken = (token) => { sessionStorage.setItem('accessToken', token); };
export const clearAccessToken = () => { sessionStorage.removeItem('accessToken'); };

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (user, accessToken, refreshToken) => {
    sessionStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, isAuthenticated: true });
  },

  updateTokens: (accessToken, refreshToken, user) => {
    sessionStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    if (user) set({ user });
  },

  logout: () => {
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useAuthStore;
