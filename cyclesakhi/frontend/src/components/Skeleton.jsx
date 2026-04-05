import React from 'react';

const Skeleton = ({ className = '', width, height, rounded = 'rounded-xl' }) => (
  <div
    className={`relative overflow-hidden bg-gray-100 ${rounded} ${className}`}
    style={{ width, height }}
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

export const DashboardSkeleton = () => (
  <div className="p-6 md:p-10 flex flex-col gap-8 w-full">
    <Skeleton height={40} width={220} />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 rounded-3xl p-8 bg-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <Skeleton height={20} width="60%" className="mb-4" />
        <Skeleton height={16} width="90%" className="mb-2" />
        <Skeleton height={16} width="75%" />
      </div>
      <div className="lg:col-span-8 rounded-3xl p-6 bg-gray-100 relative overflow-hidden" style={{ minHeight: 280 }}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <Skeleton height={20} width="40%" className="mb-4" />
        <Skeleton height={200} />
      </div>
      <div className="lg:col-span-4 rounded-3xl p-8 bg-gray-100 relative overflow-hidden" style={{ minHeight: 150 }}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <Skeleton height={20} width="50%" className="mb-4" />
        <Skeleton height={60} width="70%" />
      </div>
      <div className="lg:col-span-8 rounded-3xl p-6 bg-gray-100 relative overflow-hidden" style={{ minHeight: 250 }}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <Skeleton height={20} width="45%" className="mb-4" />
        <Skeleton height={200} />
      </div>
    </div>
  </div>
);

export default Skeleton;
