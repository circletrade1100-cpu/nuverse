import React from 'react';
import RAPBSDashboard from '../../components/RAPBS/RAPBSDashboard';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard RAPBS
          </h1>
          <p className="text-gray-600">
            Monitoring anggaran dan realisasi keuangan sekolah
          </p>
        </div>

        {/* Dashboard Content */}
        <RAPBSDashboard />
      </div>
    </div>
  );
};

export default DashboardPage;

