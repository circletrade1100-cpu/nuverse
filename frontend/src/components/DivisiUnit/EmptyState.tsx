import React from 'react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionLabel, onAction }) => {
  return (
    <div className="text-center py-12 px-6 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300">
      <PlusCircleIcon className="mx-auto h-16 w-16 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      <div className="mt-6">
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          <PlusCircleIcon className="w-5 h-5" />
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export default EmptyState;


