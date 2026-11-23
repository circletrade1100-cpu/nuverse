import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import RealizationList from '../../components/RAPBS/RealizationList';
import RealizationForm from '../../components/RAPBS/RealizationForm';
import type { RAPBSRealization } from '../../types/rapbs';

const RealisasiPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showRealizationForm, setShowRealizationForm] = useState(false);
  const [selectedRealization, setSelectedRealization] = useState<RAPBSRealization | undefined>();

  const handleRealizationAdd = () => {
    setSelectedRealization(undefined);
    setShowRealizationForm(true);
  };

  const handleRealizationEdit = (realization: RAPBSRealization) => {
    setSelectedRealization(realization);
    setShowRealizationForm(true);
  };

  const handleRealizationSave = () => {
    setShowRealizationForm(false);
    setSelectedRealization(undefined);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Realization List */}
        <RealizationList
          onAdd={handleRealizationAdd}
          onEdit={handleRealizationEdit}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Modal Form */}
      {showRealizationForm && (
        <RealizationForm
          realization={selectedRealization}
          onClose={() => setShowRealizationForm(false)}
          onSave={handleRealizationSave}
        />
      )}
    </div>
  );
};

export default RealisasiPage;

