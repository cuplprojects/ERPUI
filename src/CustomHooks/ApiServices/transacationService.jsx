import API from "../MasterApiHooks/api";
        
export const getCombinedPercentages = async (projectId) => {
  try {
    const response = await API.get(`/Transactions/combined-percentages?projectId=${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching combined percentages:', error);
    throw error;
  }
}

export const getAllProjectCompletionPercentages = async (projectIds) => {
  try {
    const response = await API.get('/Transactions/all-project-completion-percentages', {
      params: { projectIds } // Pass the project IDs as query params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all project completion percentages:', error);
    throw error;
  }
}

export const getProcessLotPercentages = async (projectId) => {
  try {
    const response = await API.get(`/Transactions/process-lot-percentages?projectId=${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching process lot percentages:', error);
    throw error;
  }
}

export const getProcessPercentages = async (projectId) => {
  try {
    const response = await API.get(`/Transactions/process-percentages?projectId=${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching process lot percentages:', error);
    throw error;
  }
}
export const getProjectTransactionsData = async (projectId, processId, isPrevious = false) => {
  try {
    const response = await API.get(`/Transactions/GetProjectTransactionsDataOld?projectId=${projectId}&processId=${processId}`);
    console.log(response.data)
    return response;
  } catch (error) {
    console.error('Error fetching project transactions data:', error);
    throw error;
  }
}
