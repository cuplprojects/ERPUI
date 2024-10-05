/**
 * AuthService: Handles authentication-related operations
 * Created by Shivom on 2023-10-05
 * 
 * This service uses the custom API instance for making requests
 */

import API from '../MasterApiHooks/api';

const AuthService = {
  login: async (username, password) => {
    try {
      const response = await API.post('/api/login', { username, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await API.post('/api/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },

  setCurrentUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  removeCurrentUser: () => {
    localStorage.removeItem('user');
  }
};

export default AuthService;