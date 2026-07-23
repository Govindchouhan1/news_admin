import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import newsService from '../services/newsService';
import toast from 'react-hot-toast';
import { extractError } from '../utils/helpers';

const useNews = (queryParams) => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  // Stable key avoids re-creating fetchNews when object reference changes but contents are same
  const paramsKey = useMemo(() => JSON.stringify(queryParams), [queryParams]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await newsService.getAll(JSON.parse(paramsKey));
      setData(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const deleteNews = useCallback(async (id) => {
    try {
      await newsService.delete(id);
      toast.success(t('news.deleteSuccess'));
      fetchNews();
    } catch (err) {
      toast.error(extractError(err));
    }
  }, [fetchNews, t]);

  return { data, pagination, loading, refetch: fetchNews, deleteNews };
};

export default useNews;
