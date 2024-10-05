import React, { useState } from 'react';
import API from '../MasterApiHooks/api';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post('/login', credentials);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await API.post('/logout');
      setUser(null);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during logout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post('/register', userData);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, login, logout, register };
};

const useSecurityQuestions = () => {
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSecurityQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/security-questions');
      setSecurityQuestions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching security questions');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitAnswers = async (answers) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post('/verify-security-answers', answers);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting security answers');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post('/reset-password', { newPassword });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { 
    securityQuestions, 
    answers, 
    setAnswers, 
    loading, 
    error, 
    fetchSecurityQuestions, 
    submitAnswers, 
    resetPassword 
  };
};

export { useAuth, useSecurityQuestions };