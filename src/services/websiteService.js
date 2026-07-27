import api from '../api/axios';

const websiteService = {
  getAll: (adminId) => api.get('/websites', { params: { adminId } }),
  getById: (id) => api.get(`/websites/${id}`),
  getProfile: (adminId) => api.get('/websites/profile', { params: { adminId } }),
  updateDomain: (clientDomain, adminId) => api.patch('/websites/profile/domain', { clientDomain, adminId }),
  create: (data, adminId) => api.post('/websites', { ...data, adminId }),
  update: (id, data) => api.put(`/websites/${id}`, data),
  remove: (id) => api.delete(`/websites/${id}`),
};

export default websiteService;
