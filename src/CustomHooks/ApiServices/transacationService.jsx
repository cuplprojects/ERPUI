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
export const getAllProjectCompletionPercentages = async () => {
  try {
    const response = await API.get('/Transactions/all-project-completion-percentages');
    return response.data;
  } catch (error) {
    console.error('Error fetching all project completion percentages:', error);
    throw error;
  }
}
