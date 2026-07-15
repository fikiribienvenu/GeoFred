import axios from 'axios';

// Create axios instance that automatically includes the JWT token
const api = axios.create({
  baseURL: '/',
  withCredentials: true, // sends cookies automatically
});

// Also attach token from localStorage as Bearer header
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('geofred_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
