import React from 'react';
import { useTranslation } from 'react-i18next';
import { TableSkeleton } from './Skeleton';
import { InboxIcon } from 'lucide-react';

const Table = ({ columns = [], data = [], loading = false, skeletonRows = 5 }) => {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`table-header ${col.className || ''}`}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="p-0">
                <TableSkeleton rows={skeletonRows} cols={columns.length} />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <InboxIcon className="w-10 h-10 mb-3 opacity-40" />
                  <p className="text-sm">{t('common.noData')}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={row.id || rowIdx} className="table-row">
                {columns.map((col) => (
                  <td key={col.key} className={`table-cell ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
