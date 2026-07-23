import axios from 'axios';
import { getAccessToken, setAccessToken } from '../store/authStore';
import useAuthStore from '../store/authStore';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://api.news-portal.uz/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const WRITE_METHODS = ['post', 'put', 'patch', 'delete', 'options'];

// Attach access token + block write requests for VIEWER role
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (WRITE_METHODS.includes(config.method?.toLowerCase())) {
      const role = useAuthStore.getState().user?.role;
      if (role === 'VIEWER') {
        return Promise.reject(
          Object.assign(new Error("Ruxsat yo'q: VIEWER faqat ma'lumot ko'ra oladi"), {
            isViewerBlocked: true,
          })
        );
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken, user } = data.data;
        setAccessToken(accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Update auth store user if needed
        try {
          const { default: useAuthStore } = await import('../store/authStore');
          useAuthStore.getState().updateTokens(accessToken, newRefreshToken, user);
        } catch (_) {}

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
