import API from "../MasterApiHooks/api";

export const fetchUsers = async () => {
    try {
        const response = await API.get("/User");
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

