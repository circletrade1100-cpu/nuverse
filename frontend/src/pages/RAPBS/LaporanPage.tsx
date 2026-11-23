import React from 'react';
import RAPBSReports from '../../components/RAPBS/RAPBSReports';

const LaporanPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Reports Content */}
        <RAPBSReports />
      </div>
    </div>
  );
};

export default LaporanPage;

