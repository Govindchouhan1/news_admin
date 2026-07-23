import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import NewsForm from '../../components/news/NewsForm';
import ImageUploader from '../../components/news/ImageUploader';
import Button from '../../components/ui/Button';
import newsService from '../../services/newsService';
import useCategories from '../../hooks/useCategories';
import usePermission from '../../hooks/usePermission';
import { extractError } from '../../utils/helpers';

const NewsCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canWrite } = usePermission();

  useEffect(() => {
    if (!canWrite) navigate('/news', { replace: true });
  }, [canWrite, navigate]);
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [createdId, setCreatedId] = useState(null);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await newsService.create(data);
      const newId = res.data.data?.id;
      toast.success(t('news.createSuccess'));
      setCreatedId(newId); // rasm qadamiga o'tish
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/news" className="btn-ghost p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t('news.createNews')}
          </h1>
          {createdId && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                News created
              </span>
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div className="ml-auto flex items-center gap-2">
          <StepDot step={1} active={!createdId} done={!!createdId} label="Details" />
          <div className="w-8 h-px bg-gray-300 dark:bg-gray-700" />
          <StepDot step={2} active={!!createdId} done={false} label="Images" />
        </div>
      </div>

      {/* ── Qadam 1: Form ── */}
      {!createdId && (
        <div className="card p-6">
          <NewsForm
            categories={categories}
            onSubmit={handleSubmit}
            loading={loading}
            newsId={null}
          />
        </div>
      )}

      {/* ── Qadam 2: Image upload ── */}
      {createdId && (
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200 dark:border-gray-800">
              <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                <ImagePlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Upload images
                </p>
                <p className="text-xs text-gray-400">
                  Optional — you can skip this step
                </p>
              </div>
            </div>

            <ImageUploader newsId={createdId} initialImages={[]} />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/news')}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Skip →
            </button>
            <Button onClick={() => navigate('/news')}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const StepDot = ({ step, active, done, label }) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
        done
          ? 'bg-green-500 border-green-500 text-white'
          : active
          ? 'bg-primary-600 border-primary-600 text-white'
          : 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-400'
      }`}
    >
      {done ? <CheckCircle2 className="w-4 h-4" /> : step}
    </div>
    <span className={`text-[10px] font-medium ${active || done ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
      {label}
    </span>
  </div>
);

export default NewsCreate;
