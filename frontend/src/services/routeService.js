import axios from 'axios';

const API_URL = 'http://localhost:5001/api/routes';

const getAuthHeader = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return {
        headers: {
            Authorization: `Bearer ${userInfo.token}`,
        },
    };
};

const getRoutes = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const getRouteById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

const createRoute = async (routeData) => {
    const response = await axios.post(API_URL, routeData, getAuthHeader());
    return response.data;
};

const updateRoute = async (id, routeData) => {
    const response = await axios.put(`${API_URL}/${id}`, routeData, getAuthHeader());
    return response.data;
};

const deleteRoute = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
};

const routeService = {
    getRoutes,
    getRouteById,
    createRoute,
    updateRoute,
    deleteRoute,
};

export default routeService;
