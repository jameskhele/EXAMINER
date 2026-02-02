import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const apiService = {
  // Authentication
  login: (credentials: any) => axiosInstance.post('/auth/login', credentials),
  signup: (userInfo: any) => axiosInstance.post('/auth/signup', userInfo),

  // Generation
  generate: (module: string, formData: FormData) => {
    return axiosInstance.post(`/generate/${module}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // History
  getHistory: () => axiosInstance.get('/history'),
};