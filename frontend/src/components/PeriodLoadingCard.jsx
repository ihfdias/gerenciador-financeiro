import React from 'react';

function PeriodLoadingCard({ lines = 3, className = '' }) {
  return (
    <div className={`glass-card p-4 ${className}`.trim()}>
      <div className="skeleton-block h-4 w-28" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }, (_, index) => (
          <div key={index} className="skeleton-block h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

export default PeriodLoadingCard;
