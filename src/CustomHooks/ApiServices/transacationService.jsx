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
