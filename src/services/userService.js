import api from '../api/axios';

const userService = {
  getAll: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  pushSchema: (id) => api.post(`/users/${id}/push-schema`),
  remove: (id) => api.delete(`/users/${id}`),
  toggleBlock: (id, isBlocked) => api.patch(`/users/${id}/block`, { isBlocked }),
};

export default userService;
