import API from '../../CustomHooks/MasterApiHooks/api';

const getRoles = async () => {
    const response = await API.get('/Roles');
    return response.data;
}

const createRole = async (roleData) => {
    const response = await API.post('/Roles', roleData);
    return response.data;
}

const updateRole = async (roleId, roleData) => {
    const response = await API.put(`/Roles/${roleId}`, roleData);
    return response.data;
}

export { getRoles, createRole, updateRole };