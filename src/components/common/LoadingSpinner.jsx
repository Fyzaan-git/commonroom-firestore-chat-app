import React from 'react';

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin rounded-full border-slate-300 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400 ${sizeMap[size] || sizeMap.md} ${className}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
