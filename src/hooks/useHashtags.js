import { useState, useEffect } from 'react';
import hashtagService from '../services/hashtagService';
import toast from 'react-hot-toast';
import { extractError } from '../utils/helpers';

const useHashtags = (params) => {
  const [hashtags, setHashtags] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await hashtagService.getAll(params);
      setHashtags(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [JSON.stringify(params)]); // eslint-disable-line

  return { hashtags, pagination, loading, refetch: fetch };
};

export default useHashtags;
