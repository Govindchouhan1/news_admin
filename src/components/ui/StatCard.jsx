import React from 'react';
import { CardSkeleton } from './Skeleton';

const StatCard = ({ icon: Icon, label, value, trend, color = 'primary', loading }) => {
  if (loading) return <CardSkeleton />;

  const colorMap = {
    primary: {
      bg: 'bg-primary-50 dark:bg-primary-900/20',
      icon: 'text-primary-600 dark:text-primary-400',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      icon: 'text-yellow-600 dark:text-yellow-400',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
    },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value ?? '—'}
          </p>
          {trend && (
            <p className="mt-1 text-xs text-gray-400">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${c.bg}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
