import { create } from 'zustand';

const USER_TOKEN_KEY = 'authToken';

const useUserTokenStore = create((set) => ({
  token: localStorage.getItem(USER_TOKEN_KEY) || null,

  setToken: (newToken) => {
    localStorage.setItem(USER_TOKEN_KEY, newToken);
    set({ token: newToken });
  },

  clearToken: () => {
    localStorage.removeItem(USER_TOKEN_KEY);
    set({ token: null });
  },

  getToken: () => {
    return localStorage.getItem(USER_TOKEN_KEY);
  },
}));

export const useUserToken = () => useUserTokenStore((state) => state.token);
export const useUserTokenActions = () => useUserTokenStore((state) => ({
  setToken: state.setToken,
  clearToken: state.clearToken,
  getToken: state.getToken,
}));

export default useUserTokenStore;

