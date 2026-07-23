import dayjs from 'dayjs';
import 'dayjs/locale/uz';

// Format: 21:12 / 03.04.2026
export const formatDate = (date) => {
  if (!date) return '—';
  const d = dayjs(date);
  return d.format('HH:mm / DD.MM.YYYY');
};

export const formatDateShort = (date) => {
  if (!date) return '—';
  return dayjs(date).format('DD.MM.YYYY');
};

export const formatDateFull = (date) => {
  if (!date) return '—';
  return dayjs(date).format('DD.MM.YYYY HH:mm:ss');
};

export const formatRelative = (date) => {
  if (!date) return '—';
  const d = dayjs(date);
  const now = dayjs();
  const diffMinutes = now.diff(d, 'minute');
  if (diffMinutes < 1) return 'Hozir';
  if (diffMinutes < 60) return `${diffMinutes} daqiqa oldin`;
  const diffHours = now.diff(d, 'hour');
  if (diffHours < 24) return `${diffHours} soat oldin`;
  const diffDays = now.diff(d, 'day');
  if (diffDays < 7) return `${diffDays} kun oldin`;
  return formatDateShort(date);
};
