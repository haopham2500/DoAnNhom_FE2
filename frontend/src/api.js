import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Laravel backend URL
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add interceptor to append Sanctum token if available
api.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 403 && error.response.data.message === 'Tài khoản của bạn đã bị khóa, vui lòng liên hệ nhân viên CSKH') {
            localStorage.removeItem('auth_token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
