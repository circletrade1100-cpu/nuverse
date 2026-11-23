import React, { useState } from 'react';
import LPJDashboard from '../components/LPJ/LPJDashboard';
import LPJList from '../components/LPJ/LPJList';
import LPJForm from '../components/LPJ/LPJForm';
import LPJDetailModal from '../components/LPJ/LPJDetailModal';
import type { LPJ } from '../types/lpj';

const LPJPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLpj, setEditingLpj] = useState<LPJ | null>(null);
  const [viewingLpj, setViewingLpj] = useState<LPJ | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdd = () => {
    setEditingLpj(null);
    setIsFormOpen(true);
  };

  const handleEdit = (lpj: LPJ) => {
    setEditingLpj(lpj);
    setIsFormOpen(true);
  };

  const handleView = (lpj: LPJ) => {
    setViewingLpj(lpj);
  };

  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setIsFormOpen(false);
    setEditingLpj(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Modul LPJ</h1>
        <p className="text-gray-600 mt-1">Laporan Pertanggung Jawaban</p>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Daftar LPJ
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'dashboard' && <LPJDashboard />}
      {activeTab === 'list' && (
        <LPJList
          onAdd={handleAdd}
          onEdit={handleEdit}
          onView={handleView}
          refreshTrigger={refreshTrigger}
        />
      )}

      {isFormOpen && (
        <LPJForm
          lpj={editingLpj}
          onClose={() => {
            setIsFormOpen(false);
            setEditingLpj(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {viewingLpj && (
        <LPJDetailModal
          isOpen={!!viewingLpj}
          onClose={() => setViewingLpj(null)}
          lpj={viewingLpj}
          onRefresh={() => {
            setRefreshTrigger(prev => prev + 1);
            setViewingLpj(null);
          }}
        />
      )}
    </div>
  );
};

export default LPJPage;

