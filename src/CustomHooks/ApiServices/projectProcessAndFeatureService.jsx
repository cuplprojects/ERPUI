import API from '../MasterApiHooks/api';

const getProjectProcessAndFeature = async (projectId, userId) => {
  if (!userId) {
    throw new Error('User ID not provided');
  }

  if (!projectId) {
    throw new Error('Project ID not provided');
  }

  try {
    const response = await API.get(`ProjectProcess?userId=${userId}&projectId=${projectId}`);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Failed to fetch project process and feature data');
    }
  } catch (error) {
    console.error('Error fetching project process and feature:', error);
    throw error;
  }
};

export { getProjectProcessAndFeature };
