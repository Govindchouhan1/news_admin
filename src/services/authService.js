import api from '../api/axios';

const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (data) =>
    api.post('/auth/register', data),

  refresh: (refreshToken) =>
    api.post('/auth/refresh', { refreshToken }),

  logout: (refreshToken) =>
    api.post('/auth/logout', { refreshToken }),
};

export default authService;
