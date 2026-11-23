import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  circle?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  rounded = true, 
  circle = false 
}) => {
  const baseClasses = 'bg-gray-200 animate-pulse';
  const roundedClass = circle ? 'rounded-full' : rounded ? 'rounded-lg' : '';
  const sizeStyles = {
    width: width || '100%',
    height: height || '1rem'
  };

  return (
    <div
      className={`${baseClasses} ${roundedClass} ${className}`}
      style={sizeStyles}
    />
  );
};

// Skeleton untuk card dashboard
export const DashboardCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <Skeleton width={60} height={20} />
        <Skeleton width={24} height={24} circle />
      </div>
      <Skeleton width="80%" height={32} className="mb-2" />
      <Skeleton width="60%" height={16} />
    </div>
  );
};

// Skeleton untuk header dengan avatar
export const HeaderSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Skeleton width={40} height={40} circle />
          <div>
            <Skeleton width={120} height={20} className="mb-2" />
            <Skeleton width={100} height={14} />
          </div>
        </div>
        <Skeleton width={24} height={24} />
      </div>
      <div className="text-center">
        <Skeleton width={200} height={24} className="mx-auto mb-2" />
        <Skeleton width={150} height={16} className="mx-auto" />
      </div>
    </div>
  );
};

// Skeleton untuk list item
export const ListItemSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3">
      <div className="flex items-center space-x-3">
        <Skeleton width={48} height={48} circle />
        <div className="flex-1">
          <Skeleton width="70%" height={16} className="mb-2" />
          <Skeleton width="50%" height={14} />
        </div>
        <Skeleton width={60} height={20} />
      </div>
    </div>
  );
};

// Skeleton untuk statistik cards
export const StatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <Skeleton width={40} height={40} circle className="mb-3" />
        <Skeleton width={80} height={16} className="mb-1" />
        <Skeleton width={60} height={20} />
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <Skeleton width={40} height={40} circle className="mb-3" />
        <Skeleton width={80} height={16} className="mb-1" />
        <Skeleton width={60} height={20} />
      </div>
    </div>
  );
};

// Skeleton untuk tab content
export const TabContentSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <ListItemSkeleton key={item} />
      ))}
    </div>
  );
};

// Skeleton untuk form
export const FormSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton width={80} height={16} className="mb-2" />
        <Skeleton width="100%" height={40} />
      </div>
      <div>
        <Skeleton width={100} height={16} className="mb-2" />
        <Skeleton width="100%" height={40} />
      </div>
      <div>
        <Skeleton width={60} height={16} className="mb-2" />
        <Skeleton width="100%" height={100} />
      </div>
      <Skeleton width={120} height={40} />
    </div>
  );
};

// Skeleton untuk payroll card
export const PayrollCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton width={100} height={20} />
        <Skeleton width={24} height={24} />
      </div>
      <div className="text-center mb-4">
        <Skeleton width={150} height={32} className="mx-auto mb-2" />
        <Skeleton width={100} height={16} className="mx-auto" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <Skeleton width={80} height={16} className="mb-1" />
          <Skeleton width={100} height={20} />
        </div>
        <div className="text-center">
          <Skeleton width={80} height={16} className="mb-1" />
          <Skeleton width={100} height={20} />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
