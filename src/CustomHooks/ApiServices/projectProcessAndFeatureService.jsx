import API from '../MasterApiHooks/api';

const getProjectProcessAndFeature = async (projectId, userId) => {
  if (!userId) {
    throw new Error('User ID not provided');
  }

  try {
    const response = await API.get(`/ProjectProcess/${userId}/${projectId}`);
    if (response.status === 200) {
      console.log(response.data)
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
