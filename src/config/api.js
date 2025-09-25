

const API_CONFIG = {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    },
    vtcId: process.env.REACT_APP_TNL_VTC_ID || '12345' // Replace with actual TNL VTC ID
};

export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getFullUrl = (endpoint) => {
    return `${API_CONFIG.baseURL}${endpoint}`;
};

export default API_CONFIG; 