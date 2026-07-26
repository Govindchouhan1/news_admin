import api from '../api/axios';

const websiteService = {
  getAll: () => api.get('/websites'),
  getById: (id) => api.get(`/websites/${id}`),
  getProfile: () => api.get('/websites/profile'),
  updateDomain: (clientDomain) => api.patch('/websites/profile/domain', { clientDomain }),
  create: (data) => api.post('/websites', data),
  update: (id, data) => api.put(`/websites/${id}`, data),
  remove: (id) => api.delete(`/websites/${id}`),
};

export default websiteService;
