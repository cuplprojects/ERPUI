/**
 * AuthService: Handles authentication-related operations
 * Created by Shivom on 2023-10-05
 * Updated to use useUserTokenStore for token management
 * 
 * This service uses the custom API instance for making requests
 */

import API from '../MasterApiHooks/api';
import useUserTokenStore from '../../store/useUserToken';
import useUserDataStore from '../../store/userDataStore';

const AuthService = {
  login: async (username, password) => {
    try {
      const response = await API.post('/Login/login', { userName: username, password });
      if (response.status === 200 && response.data.token) {
        const { setToken } = useUserTokenStore.getState();
        setToken(response.data.token);
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    const { clearToken } = useUserTokenStore.getState();
    const { actions } = useUserDataStore.getState();
    
    clearToken();
    actions.clearUserData();
  }
};

export default AuthService;