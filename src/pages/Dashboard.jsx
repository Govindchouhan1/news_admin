import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Newspaper,
  CheckCircle2,
  FileText,
  Eye,
  ThumbsUp,
  ArrowRight,
} from 'lucide-react';
import newsService from '../services/newsService';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';
import { formatDate, formatRelative } from '../utils/dateFormatter';


const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [topViewed, setTopViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allRes, publishedRes, draftRes, viewedRes] = await Promise.all([
          newsService.getAll({ limit: 1 }),
          newsService.getAll({ status: 'PUBLISHED', limit: 1 }),
          newsService.getAll({ status: 'DRAFT', limit: 1 }),
          newsService.getAll({ sort: 'most_viewed', limit: 5 }),
        ]);

        const recentRes = await newsService.getAll({ sort: 'id_desc', limit: 8 });

        setStats({
          total: allRes.data.pagination?.total ?? 0,
          published: publishedRes.data.pagination?.total ?? 0,
          draft: draftRes.data.pagination?.total ?? 0,
        });
        setRecent(recentRes.data.data ?? []);
        setTopViewed(viewedRes.data.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      icon: Newspaper,
      label: t('dashboard.totalNews'),
      value: stats?.total,
      color: 'primary',
    },
    {
      icon: CheckCircle2,
      label: t('dashboard.publishedNews'),
      value: stats?.published,
      color: 'green',
    },
    {
      icon: FileText,
      label: t('dashboard.draftNews'),
      value: stats?.draft,
      color: 'yellow',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t('dashboard.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {formatDate(new Date())}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent News */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('dashboard.recentNews')}
            </h2>
            <Link
              to="/news"
              className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              {t('common.view')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <TableSkeleton rows={5} cols={3} />
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">
                        {item.category?.name || '—'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatRelative(item.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        item.status === 'PUBLISHED'
                          ? 'success'
                          : item.status === 'DRAFT'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {t(`news.${item.status?.toLowerCase()}`)}
                    </Badge>
                  </div>
                </div>
              ))}
              {recent.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">
                  {t('common.noData')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Top Viewed */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <Eye className="w-4 h-4 text-primary-500" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('dashboard.topViewed')}
            </h2>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {topViewed.map((item, i) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-lg font-bold text-gray-200 dark:text-gray-700 w-6 shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <Eye className="w-3 h-3" />
                      {item.viewCount?.toLocaleString() || 0}
                      <ThumbsUp className="w-3 h-3 ml-1" />
                      {item.likeCount || 0}
                    </div>
                  </div>
                </div>
              ))}
              {topViewed.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">
                  {t('common.noData')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
