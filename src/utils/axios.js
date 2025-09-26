import axios from 'axios';
import API_CONFIG, { getAuthHeader } from '../config/api';

const axiosInstance = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: API_CONFIG.headers
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const authHeader = getAuthHeader();
        if (authHeader.Authorization) {
            config.headers.Authorization = authHeader.Authorization;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only handle auth errors for non-login routes
        if (error.response?.status === 401 && 
            !window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register')) {
            // Clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 

// Helper: fetch ETS2 map data (cached server-side for 3 days)
export async function fetchEts2Map() {
  const { data } = await axiosInstance.get('/mapdata/ets2');
  return data;
}