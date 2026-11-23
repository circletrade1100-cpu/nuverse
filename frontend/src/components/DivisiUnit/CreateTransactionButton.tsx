import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface CreateTransactionButtonProps {
  onClick: () => void;
  label?: string;
}

const CreateTransactionButton: React.FC<CreateTransactionButtonProps> = ({ 
  onClick, 
  label = 'Tambah Transaksi' 
}) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <PlusIcon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
};

export default CreateTransactionButton;

