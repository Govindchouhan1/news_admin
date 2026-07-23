import api from '../api/axios';

const hashtagService = {
  getAll: (params) => api.get('/hashtags', { params }),
  create: (data) => api.post('/hashtags', data),
  delete: (id) => api.delete(`/hashtags/${id}`),
};

export default hashtagService;
