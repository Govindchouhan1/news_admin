import { create } from 'zustand';

// Access token is kept in memory only (not localStorage) for security
let _accessToken = null;

export const getAccessToken = () => _accessToken;
export const setAccessToken = (token) => { _accessToken = token; };
export const clearAccessToken = () => { _accessToken = null; };

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (user, accessToken, refreshToken) => {
    _accessToken = accessToken;
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, isAuthenticated: true });
  },

  updateTokens: (accessToken, refreshToken, user) => {
    _accessToken = accessToken;
    localStorage.setItem('refreshToken', refreshToken);
    if (user) set({ user });
  },

  logout: () => {
    _accessToken = null;
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useAuthStore;
