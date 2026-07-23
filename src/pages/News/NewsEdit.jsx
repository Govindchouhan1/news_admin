import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import NewsForm from '../../components/news/NewsForm';
import newsService from '../../services/newsService';
import useCategories from '../../hooks/useCategories';
import usePermission from '../../hooks/usePermission';
import { extractError } from '../../utils/helpers';
import { FormSkeleton } from '../../components/ui/Skeleton';

const NewsEdit = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { canWrite } = usePermission();
  const { categories } = useCategories();
  const [newsItem, setNewsItem] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!canWrite) navigate('/news', { replace: true });
  }, [canWrite, navigate]);

  useEffect(() => {
    const fetchNews = async () => {
      setFetching(true);
      try {
        const res = await newsService.getById(id);
        setNewsItem(res.data.data);
      } catch (err) {
        toast.error(extractError(err));
        navigate('/news');
      } finally {
        setFetching(false);
      }
    };
    fetchNews();
  }, [id, navigate]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      await newsService.update(id, data);
      toast.success(t('news.updateSuccess'));
      navigate('/news');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/news" className="btn-ghost p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t('news.editNews')}
          </h1>
          {newsItem && (
            <p className="text-xs text-gray-400 truncate max-w-sm">{newsItem.title}</p>
          )}
        </div>
      </div>

      <div className="card p-6">
        {fetching ? (
          <FormSkeleton />
        ) : newsItem ? (
          <NewsForm
            defaultValues={newsItem}
            categories={categories}
            onSubmit={handleSubmit}
            loading={saving}
            newsId={id}
          />
        ) : null}
      </div>
    </div>
  );
};

export default NewsEdit;
