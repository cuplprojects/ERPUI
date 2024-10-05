// File created by Shivom on 2023-10-05
// This file contains a custom Axios instance for making API requests.
// It sets up a base URL and includes an interceptor for adding authentication tokens.
// To use, import this file and call methods like API.get(), API.post(), etc.

// Import axios library for making HTTP requests
import axios from 'axios';

// Set the base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Base URL from Vite env or fallback

// Create an Axios instance
const API = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to attach the token to all requests (if you have one)
API.interceptors.request.use(
  (config) => {
    const TOKEN = sessionStorage.getItem('token'); // Replace with Zustand store or any other method for fetching token

    if (TOKEN) {
      config.headers.Authorization = `Bearer ${TOKEN}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export the Axios instance for use in other parts of the application
export default API;
