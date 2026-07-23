import api from '../api/axios';

const newsService = {
  getAll: (params) => api.get('/news', { params }),

  getById: (id) => api.get(`/news/${id}`),

  getBySlug: (slug) => api.get(`/news/slug/${slug}`),

  create: (data) => api.post('/news', data),

  update: (id, data) => api.put(`/news/${id}`, data),

  delete: (id) => api.delete(`/news/${id}`),

  uploadImages: (newsId, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return api.post(`/images/news/${newsId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteImage: (imageId) => api.delete(`/images/${imageId}`),

  getImages: (newsId) => api.get(`/images/news/${newsId}`),

  bulk: (ids, action) => api.patch('/news/bulk', { ids, action }),
};

export default newsService;
