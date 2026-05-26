import axios from 'axios';
import API_BASE_URL from '../config/api';

const getBaseURL = () => {
    return API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
};

const api = axios.create({
    baseURL: getBaseURL(),
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
