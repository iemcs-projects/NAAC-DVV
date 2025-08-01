// src/api/api.js
import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken  } from '../auth/tokenMemory';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true, // allows cookie to be sent
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  // No need to manually set Authorization header as cookies will be sent automatically
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        // The refresh token is sent via cookie
        const res = await api.post('/auth/refresh-token');
        const { accessToken, expiresAt } = res.data;
        setAccessToken(accessToken, expiresAt);
        return api(originalRequest);
      } catch (e) {
        clearTokens();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
