import { useState, useEffect } from 'react';
import categoryService from '../services/categoryService';
import toast from 'react-hot-toast';
import { extractError } from '../utils/helpers';

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.data || []);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  return { categories, loading, refetch: fetch };
};

export default useCategories;
