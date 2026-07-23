import api from '../api/axios';

const settingsService = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export default settingsService;
