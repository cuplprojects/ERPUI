// permissionUtils.js
import { useUserData } from '../../store/userDataStore';
import { permissionOptions } from '../../pages/Roles/Permissions';

const isDevelopmentMode = import.meta.env.VITE_APP_MODE === 'development';

/**
 * Custom hook to retrieve user permissions from the user data store
 * @returns {string[]} Array of permission strings
 */
export const useUserPermissions = () => {
  const userData = useUserData();
  return userData?.role?.permissions || [];
};

/**
 * Recursively finds a permission node in the permission tree
 * @param {Array} tree - Permission tree to search
 * @param {string} key - Permission key to find
 * @returns {Object|null} Found permission node or null
 */
const findPermissionNode = (tree, key) => {
  for (const node of tree) {
    if (node.key === key) {
      return node;
    }
    if (node.children) {
      const found = findPermissionNode(node.children, key);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Gets all parent permission keys for a given permission
 * @param {string} permission - Permission key
 * @returns {string[]} Array of parent permission keys
 */
const getParentPermissions = (permission) => {
  const parents = [];
  const parts = permission.split('.');
  while (parts.length > 1) {
    parts.pop();
    const parentKey = parts.join('.');
    const parentNode = findPermissionNode(permissionOptions, parentKey);
    if (parentNode) {
      parents.push(parentNode.key);
    }
  }
  return parents;
};

/**
 * Gets all child permission keys for a given permission node
 * @param {Object} node - Permission node
 * @returns {string[]} Array of child permission keys
 */
const getChildPermissions = (node) => {
  const children = [];
  if (node.children) {
    for (const child of node.children) {
      children.push(child.key);
      children.push(...getChildPermissions(child));
    }
  }
  return children;
};

/**
 * Checks if the user has a specific permission or any child permissions
 * 
 * @param {string} permission - The permission to check
 * @returns {boolean} - True if the user has the permission or any child/parent permissions, or if in development mode
 */
export const hasPermission = (permission) => {
  if (isDevelopmentMode) {
    return true;
  }

  const userPermissions = useUserPermissions(); // Use the new hook here
  
  // Check direct permission
  if (userPermissions.includes(String(permission))) {
    return true;
  }

  // Check parent permissions
  const parentPermissions = getParentPermissions(permission);
  if (parentPermissions.some(p => userPermissions.includes(p))) {
    return true;
  }

  // Check child permissions
  const node = findPermissionNode(permissionOptions, permission);
  if (node) {
    const childPermissions = getChildPermissions(node);
    if (childPermissions.some(p => userPermissions.includes(p))) {
      return true;
    }
  }

  return false;
};
