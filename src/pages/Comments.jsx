import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, MessageSquare, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import useUiStore from '../store/uiStore';
import usePermission from '../hooks/usePermission';
import commentService from '../services/commentService';
import newsService from '../services/newsService';
import { extractError, truncate } from '../utils/helpers';
import { formatDate } from '../utils/dateFormatter';

const Comments = () => {
  const { t } = useTranslation();
  const { openConfirm } = useUiStore();
  const { canWrite } = usePermission();
  const [selectedNewsId, setSelectedNewsId] = useState('');
  const [newsList, setNewsList] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Load news for selector
  useEffect(() => {
    const fetchNews = async () => {
      setNewsLoading(true);
      try {
        const res = await newsService.getAll({ limit: 100, status: 'PUBLISHED', sort: 'id_desc' });
        setNewsList(res.data.data || []);
      } catch (_) {}
      setNewsLoading(false);
    };
    fetchNews();
  }, []);

  // Load comments — all (id_desc) or by selected news
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = selectedNewsId
          ? await commentService.getByNews(selectedNewsId, { page, limit: 20 })
          : await commentService.getAll({ page, limit: 20, sort: 'id_desc' });
        setComments(res.data.data || []);
        setPagination(res.data.pagination || null);
      } catch (err) {
        toast.error(extractError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [selectedNewsId, page]);

  const handleDelete = (comment) => {
    openConfirm({
      title: t('common.delete'),
      message: t('comments.deleteConfirm'),
      onConfirm: async () => {
        try {
          await commentService.delete(comment.id);
          toast.success(t('comments.deleteSuccess'));
          setComments((prev) => prev.filter((c) => c.id !== comment.id));
        } catch (err) {
          toast.error(extractError(err));
        }
      },
    });
  };

  const columns = [
    {
      key: 'username',
      header: t('comments.author'),
      width: 120,
      render: (val) => (
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{val || '—'}</span>
      ),
    },
    {
      key: 'content',
      header: t('comments.content'),
      render: (val) => (
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">{truncate(val, 150)}</p>
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
      width: 70,
      render: (_, row) => (
        <button
          onClick={() => handleDelete(row)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        {t('comments.title')}
      </h1>

      {/* News selector */}
      <div className="card p-4">
        <div className="max-w-lg">
          <label className="label">{t('comments.selectNews')}</label>
          <div className="relative">
            <select
              value={selectedNewsId}
              onChange={(e) => { setSelectedNewsId(e.target.value); setPage(1); }}
              className="input-field appearance-none pr-8"
              disabled={newsLoading}
            >
              <option value="">{t('comments.selectNews')}</option>
              {newsList.map((n) => (
                <option key={n.id} value={n.id}>
                  {truncate(n.title, 80)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Comments table */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <MessageSquare className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {pagination?.total ?? 0} {t('comments.title').toLowerCase()}
          </span>
        </div>
        <Table columns={columns} data={comments} loading={loading} />
        {pagination && pagination.totalPages > 1 && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={20}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;
