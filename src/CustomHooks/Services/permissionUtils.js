// permissionUtils.js
import { useUserData } from '../../store/userDataStore';

const isDevelopmentMode = import.meta.env.VITE_APP_MODE === 'development';

/**
 * Checks if the user has a specific permission or if in development mode
 * 
 * @param {string} permission - The permission to check
 * @returns {boolean} - True if the user has the permission or in development mode, false otherwise
 */
export const hasPermission = (permission) => {
  if (isDevelopmentMode) {
    return true;
  }
  
  const userData = useUserData();
  if (userData?.role?.roleId === 1) {
    return true;
  }
  
  return userData?.role?.permissions?.includes(String(permission)) || false;
};
