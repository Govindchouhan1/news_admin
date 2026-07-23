import { useState, useCallback, useEffect, useRef } from 'react';

const DEFAULT_FILTERS = {
  page: 1,
  limit: 10,
  sort: 'id_desc',
  search: '',
  category: '',
  hashtag: '',
  status: '',
  time: '',
};

const useNewsFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, ...initialFilters });
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const searchTimer = useRef(null);

  // Debounce search input
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [filters.search]);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Reset to page 1 whenever a filter changes (not page itself)
      ...(key !== 'page' ? { page: 1 } : {}),
    }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Build query params for API (use debounced search)
  const queryParams = Object.fromEntries(
    Object.entries({
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort || undefined,
      search: debouncedSearch || undefined,
      category: filters.category || undefined,
      hashtag: filters.hashtag || undefined,
      status: filters.status || undefined,
      time: filters.time || undefined,
    }).filter(([, v]) => v !== undefined)
  );

  const hasActiveFilters =
    !!(filters.search || filters.category || filters.hashtag || filters.status || filters.time);

  return {
    filters,
    queryParams,
    hasActiveFilters,
    setFilter,
    setPage,
    resetFilters,
  };
};

export default useNewsFilters;
