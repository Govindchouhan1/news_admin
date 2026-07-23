import api from '../api/axios';

const commentService = {
  getAll: (params) => api.get('/comments', { params }),
  getByNews: (newsId, params) => api.get(`/comments/news/${newsId}`, { params }),
  create: (data) => api.post('/comments', data),
  delete: (id) => api.delete(`/comments/${id}`),
};

export default commentService;
