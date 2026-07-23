import { useState, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ImageOff, CheckSquare, Square, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import NewsFilters from '../../components/news/NewsFilters';
import useNews from '../../hooks/useNews';
import useNewsFilters from '../../hooks/useNewsFilters';
import useCategories from '../../hooks/useCategories';
import useHashtags from '../../hooks/useHashtags';
import useUiStore from '../../store/uiStore';
import usePermission from '../../hooks/usePermission';
import newsService from '../../services/newsService';
import { formatDate } from '../../utils/dateFormatter';
import { getImageUrl, extractError } from '../../utils/helpers';

const Placeholder = () => (
  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 flex items-center justify-center">
    <ImageOff className="w-4 h-4 text-gray-400" />
  </div>
);

const NewsThumb = memo(({ url }) => {
  const src = getImageUrl(url);
  if (!src) return <Placeholder />;

  return (
    <div className="relative w-10 h-10 shrink-0">
      <img
        key={src}
        src={src}
        alt=""
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextSibling.style.display = 'flex';
        }}
        className="w-10 h-10 rounded-lg object-cover"
      />
      <div
        style={{ display: 'none' }}
        className="absolute inset-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 items-center justify-center"
      >
        <ImageOff className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
});

const NewsList = () => {
  const { t } = useTranslation();
  const { openConfirm } = useUiStore();
  const { canWrite } = usePermission();
  const { categories } = useCategories();
  const { hashtags } = useHashtags({ limit: 100 });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const { filters, queryParams, hasActiveFilters, setFilter, setPage, resetFilters } =
    useNewsFilters();

  const { data, pagination, loading, deleteNews, refetch } = useNews(queryParams);

  const allSelected = data.length > 0 && data.every((item) => selectedIds.has(item.id));

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((item) => item.id)));
    }
  }, [allSelected, data]);

  const handleBulkAction = async (action) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    const label = action === 'publish' ? 'publish' : action === 'draft' ? 'set to draft' : 'delete';

    openConfirm({
      title: `Bulk ${action}`,
      message: `${label.charAt(0).toUpperCase() + label.slice(1)} ${ids.length} selected news items?`,
      onConfirm: async () => {
        setBulkLoading(true);
        try {
          await newsService.bulk(ids, action);
          toast.success(`${ids.length} items ${action === 'delete' ? 'deleted' : 'updated'}`);
          setSelectedIds(new Set());
          refetch();
        } catch (err) {
          toast.error(extractError(err));
        } finally {
          setBulkLoading(false);
        }
      },
      variant: action === 'delete' ? 'danger' : 'info',
    });
  };

  const handleDelete = (row) => {
    openConfirm({
      title: t('common.delete'),
      message: t('news.deleteConfirm'),
      onConfirm: () => deleteNews(row.id),
      variant: 'danger',
    });
  };

  const checkboxCol = {
    key: '_select',
    header: (
      <button onClick={toggleAll} className="flex items-center justify-center w-4 h-4" title={allSelected ? 'Deselect all' : 'Select all'}>
        {allSelected ? <CheckCheck className="w-4 h-4 text-primary-600" /> : <Square className="w-4 h-4 text-gray-400" />}
      </button>
    ),
    width: 40,
    render: (_val, row) => (
      <button onClick={() => toggleSelect(row.id)} className="flex items-center justify-center w-4 h-4">
        {selectedIds.has(row.id) ? (
          <CheckSquare className="w-4 h-4 text-primary-600" />
        ) : (
          <Square className="w-4 h-4 text-gray-300 dark:text-gray-600" />
        )}
      </button>
    ),
  };

  const columns = [
    ...(canWrite ? [checkboxCol] : []),
    {
      key: 'title',
      header: t('news.newsTitle'),
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <NewsThumb url={row.images?.[0]?.url} />

          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[260px]">
              {val}
            </p>
            <p className="text-xs text-gray-400 truncate max-w-[260px]">
              {row.author?.username}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: t('news.category'),
      width: 120,
      render: (val) =>
        val ? (
          <span className="text-xs text-gray-600 dark:text-gray-400">{val.name}</span>
        ) : (
          '—'
        ),
    },
    {
      key: 'status',
      header: t('news.status'),
      width: 140,
      render: (val) => (
        <Badge
          variant={
            val === 'PUBLISHED' ? 'success' : val === 'DRAFT' ? 'warning' : 'danger'
          }
        >
          {t(`news.${val?.toLowerCase()}`)}
        </Badge>
      ),
    },
    {
      key: 'rank',
      header: t('news.rank'),
      width: 70,
      render: (val) => (
        <span className="text-xs font-semibold text-gray-500">{val ?? 0}</span>
      ),
    },
    {
      key: 'viewCount',
      header: t('news.views'),
      width: 80,
      render: (val) => (
        <span className="text-xs text-gray-500">{(val || 0).toLocaleString()}</span>
      ),
    },
    {
      key: 'createdAt',
      header: t('common.createdAt'),
      width: 140,
      render: (val) => (
        <span className="text-xs text-gray-400">{formatDate(val)}</span>
      ),
    },
    ...(canWrite ? [{
      key: 'actions',
      header: t('common.actions'),
      width: 90,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Link
            to={`/news/${row.id}/edit`}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={t('common.edit')}
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title={t('common.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t('news.title')}
          {pagination && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({pagination.total})
            </span>
          )}
        </h1>
        <div className="flex items-center gap-3">
          {canWrite && (
            <Link to="/news/create">
              <Button icon={Plus}>{t('news.createNews')}</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
          <CheckSquare className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" variant="secondary" onClick={() => handleBulkAction('publish')} loading={bulkLoading}>
              Publish
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleBulkAction('draft')} loading={bulkLoading}>
              Set Draft
            </Button>
            <Button size="sm" variant="danger" onClick={() => handleBulkAction('delete')} loading={bulkLoading}>
              Delete
            </Button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-1 underline"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <NewsFilters
        filters={filters}
        onFilterChange={setFilter}
        onReset={resetFilters}
        categories={categories}
        hashtags={hashtags}
        hasActive={hasActiveFilters}
      />

      {/* Table */}
      <div className="card overflow-hidden">
        <Table columns={columns} data={data} loading={loading} skeletonRows={10} />
        {pagination && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit || filters.limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsList;
