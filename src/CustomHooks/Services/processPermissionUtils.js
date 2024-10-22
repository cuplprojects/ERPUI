// processPermissionUtils.js

const isDevelopmentMode = import.meta.env.VITE_APP_MODE === 'development';

/**
 * Checks if a specific process has permission for a feature
 * 
 * @param {number} processId - The ID of the process
 * @param {number} featureId - The ID of the feature
 * @returns {boolean} - True if the process has the feature or in development mode, false otherwise
 */

export const hasFeaturePermission = (processId, featureId, featureData) => {
  if (isDevelopmentMode) {
    return true;
  }
  if (!featureData) {
    return false;
  }
  const process = featureData.find(p => p.processId === processId);
  if (process) {
    return process.featuresList.includes(featureId);
  }
  return false;
};
