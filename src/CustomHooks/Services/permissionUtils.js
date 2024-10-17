// permissionUtils.js

const userpermissions = [
  "1",
  "2",
  "2.1",
  "2.2",
  "2.3",
  "2.4",
  "2.5",
  "2.6",
  "2.7",
  "2.8",
  "2.9",
  "2.10",
  "2.1.1",
  "2.1.2",
  "2.1.3",
  "2.1.4",
  "2.2.0",
  "2.3.0",
  "2.4.0",
  "2.5.0",
  "2.6.0",
  "2.7.0",
  "2.1.1.0",
  "2.1.2.0",
  "2.1.3.0",
  "2.1.4.0",
  "2.2.1",
  "2.2.2",
  "2.2.3",
  "2.2.4",
  "2.2.5",
  "2.2.6",
  "2.3.1",
  "2.3.2",
  "2.3.3",
  "2.3.4",
  "2.3.5",
  "2.3.6",
  "2.4.1",
  "2.4.2",
  "2.4.3",
  "2.4.4",
  "2.4.5",
  "2.4.6",
  "2.5.1",
  "2.5.2",
  "2.5.3",
  "2.5.4",
  "2.5.5",
  "2.5.6",
  "2.6.1",
  "2.6.2",
  "2.6.3",
  "2.6.4",
  "2.6.5",
  "2.6.6",
  "2.7.1",
  "2.7.2",
  "2.7.3",
  "2.7.4",
  "2.7.5",
  "2.7.6",
  "2.1.1.1",
  "2.1.1.2",
  "2.1.1.3",
  "2.1.1.4",
  "2.1.1.5",
  "2.1.1.6",
  "2.1.2.1",
  "2.1.2.2",
  "2.1.2.3",
  "2.1.2.4",
  "2.1.2.5",
  "2.1.2.6",
  "2.1.3.1",
  "2.1.3.2",
  "2.1.3.3",
  "2.1.3.4",
  "2.1.3.5",
  "2.1.3.6",
  "2.1.4.1",
  "2.1.4.2",
  "2.1.4.3",
  "2.1.4.4",
  "2.1.4.5",
  "2.1.4.6",
  "3",
  "4",
];

/**
 * Checks if the user has permission for a specific action.
 *
 * @param {string} permission - The permission to check.
 * @returns {boolean} - True if the action is permitted, false otherwise.
 */
export const hasPermission = (permission) => {
  // Convert permission to string to ensure it can be compared as a string
  const permissionString = String(permission);

  // The function always returns true because it's checking for "1",
  // which is not in the userpermissions array.
  // This is likely a bug and should be fixed.
  return userpermissions.includes(permissionString);
};

// Note: The current implementation of hasPermission will always return false
// because "1" is not in the userpermissions array. To fix this, remove the
// hardcoded "1" and use the passed permission parameter instead.
