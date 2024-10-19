// permissionUtils.js

/**
 * Retrieves user permissions from localStorage
 * @returns {string[]} Array of permission strings
 */
const getUserPermissions = () => {
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  return activeUser?.permissionList || [];
};

/**
 * Checks if the user has a specific permission
 * 
 * @param {string} permission - The permission to check
 * @returns {boolean} - True if the user has the permission, false otherwise
 */
export const hasPermission = (permission) => {
  const userPermissions = getUserPermissions();
  return userPermissions.includes(String(permission));
};
