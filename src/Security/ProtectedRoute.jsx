import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserToken } from '../store/useUserToken';
import { jwtDecode } from 'jwt-decode';
import { hasPermission } from '../CustomHooks/Services/permissionUtils';
import AuthService from '../CustomHooks/ApiServices/AuthService';
import { ToastContainer } from 'react-toastify';

const ProtectedRoute = ({ component: Component, permission }) => {
  const token = useUserToken();
  const { logout } = AuthService;

  const isTokenValid = (token) => {
    if (!token) {
      return false;
    }
    
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  if (!token || !isTokenValid(token)) {
    logout();
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/login" replace />;
  }

  return <>
  <Component />
  </>;
};

export default ProtectedRoute;
