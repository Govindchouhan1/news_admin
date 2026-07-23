import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="overflow-hidden">
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-200 dark:border-gray-800">
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i} className="px-4 py-3">
              <Skeleton className="h-4 w-24" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, row) => (
          <tr key={row} className="table-row">
            {Array.from({ length: cols }).map((_, col) => (
              <td key={col} className="px-4 py-3">
                <Skeleton className={`h-4 ${col === 0 ? 'w-32' : 'w-20'}`} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const CardSkeleton = () => (
  <div className="card p-5 space-y-3">
    <Skeleton className="h-5 w-1/3" />
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export const FormSkeleton = () => (
  <div className="space-y-5">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
  </div>
);

export default Skeleton;
