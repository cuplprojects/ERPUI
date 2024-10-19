import { create } from 'zustand';
import { getLoggedUserById } from '../CustomHooks/ApiServices/userService';

const useUserDataStore = create((set) => ({
  userData: null,
  loading: false,
  error: null,

  fetchUserData: async () => {
    set({ loading: true });
    try {
      const response = await getLoggedUserById();
      set({ userData: response, loading: false, error: null });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateUserData: async (updatedData) => {
    set({ loading: true });
    try {
      // Note: The userService doesn't have an update method, so this is left as a placeholder
      // You may need to implement an update method in userService.jsx
      const response = await getLoggedUserById(); // Fetching updated data after update
      set({ userData: response, loading: false, error: null });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  clearUserData: () => set({ userData: null, error: null }),
}));

export default useUserDataStore;
