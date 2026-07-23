// API URL dan media base avtomatik chiqariladi
// REACT_APP_API_URL = "http://localhost:3000/api/v1"  →  base = "http://localhost:3000"
const MEDIA_BASE = (() => {
  if (process.env.REACT_APP_MEDIA_URL) return process.env.REACT_APP_MEDIA_URL;
  const api = process.env.REACT_APP_API_URL || 'https://api.news-portal.uz/api/v1';
  return api.replace(/\/api\/v\d+\/?$/, '').replace(/\/$/, '');
})();

export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${MEDIA_BASE}${path}`;
};

export const truncate = (str, max = 80) => {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '...' : str;
};

export const extractError = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.errors) {
    return error.response.data.errors.map((e) => e.message).join(', ');
  }
  if (error?.message) return error.message;
  return 'Xatolik yuz berdi';
};

export const STATUS_COLORS = {
  PUBLISHED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  DRAFT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  DELETED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const ROLE_COLORS = {
  BOSS: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ADMIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  VIEWER: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export const SORT_OPTIONS = [
  { value: 'id_desc', label: 'news.idDesc' },
  { value: 'id_asc', label: 'news.idAsc' },
  { value: 'most_viewed', label: 'news.mostViewed' },
  { value: 'most_liked', label: 'news.mostLiked' },
  { value: 'most_commented', label: 'news.mostCommented' },
  { value: 'rank_desc', label: 'news.rankDesc' },
];

export const TIME_OPTIONS = [
  { value: '', label: 'common.all' },
  { value: 'today', label: 'news.today' },
  { value: 'this_week', label: 'news.thisWeek' },
  { value: 'this_month', label: 'news.thisMonth' },
];

export const STATUS_OPTIONS = [
  { value: '', label: 'common.all' },
  { value: 'DRAFT', label: 'news.draft' },
  { value: 'PUBLISHED', label: 'news.published' },
  { value: 'DELETED', label: 'news.deleted' },
];
