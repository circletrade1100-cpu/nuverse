import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  BuildingOfficeIcon, 
  CurrencyDollarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import DanusDashboard from '../../components/DANUS/DanusDashboard';
import BusinessUnitList from '../../components/DANUS/BusinessUnitList';
import BusinessUnitForm from '../../components/DANUS/BusinessUnitForm';
import TransactionList from '../../components/DANUS/TransactionList';
import TransactionForm from '../../components/DANUS/TransactionForm';
import DebugPanel from '../../components/DANUS/DebugPanel';
import { type BusinessUnit, type BusinessTransaction } from '../../services/danusService';

interface ReportCardProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, icon, onClick }) => (
  <div 
    onClick={onClick}
    className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
  >
    <div className="flex items-center mb-4">
      <div className="text-3xl mr-3">{icon}</div>
      <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
        {title}
      </h4>
    </div>
    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
      Lihat Laporan
      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </div>
);

const DanusPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Form states
  const [showBusinessUnitForm, setShowBusinessUnitForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<BusinessUnit | undefined>();
  const [selectedTransaction, setSelectedTransaction] = useState<BusinessTransaction | undefined>();

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'business-units', name: 'Unit Usaha', icon: BuildingOfficeIcon },
    { id: 'transactions', name: 'Transaksi', icon: CurrencyDollarIcon },
    { id: 'reports', name: 'Laporan', icon: DocumentTextIcon },
  ];

  const handleBusinessUnitAdd = () => {
    setSelectedBusinessUnit(undefined);
    setShowBusinessUnitForm(true);
  };

  const handleBusinessUnitEdit = (unit: BusinessUnit) => {
    setSelectedBusinessUnit(unit);
    setShowBusinessUnitForm(true);
  };

  const handleBusinessUnitView = (unit: BusinessUnit) => {
    // TODO: Implement view business unit details
    console.log('View business unit:', unit);
  };

  const handleBusinessUnitSave = () => {
    console.log('🔄 Business unit saved, triggering refresh...');
    setShowBusinessUnitForm(false);
    setSelectedBusinessUnit(undefined);
    // Force refresh by incrementing the trigger
    setRefreshTrigger(prev => {
      const newTrigger = prev + 1;
      console.log('🔄 Refresh trigger updated from', prev, 'to', newTrigger);
      return newTrigger;
    });
  };

  const handleTransactionAdd = () => {
    setSelectedTransaction(undefined);
    setShowTransactionForm(true);
  };

  const handleTransactionEdit = (transaction: BusinessTransaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleTransactionSave = () => {
    setShowTransactionForm(false);
    setSelectedTransaction(undefined);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReportClick = (reportType: string) => {
    // TODO: Implement report functionality
    console.log('Opening report:', reportType);
    alert(`Fitur laporan "${reportType}" akan segera tersedia!`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DanusDashboard />;
      
      case 'business-units':
        return (
          <BusinessUnitList
            onAdd={handleBusinessUnitAdd}
            onEdit={handleBusinessUnitEdit}
            onView={handleBusinessUnitView}
            refreshTrigger={refreshTrigger}
          />
        );
      
      case 'transactions':
        return (
          <TransactionList
            onAdd={handleTransactionAdd}
            onEdit={handleTransactionEdit}
            refreshTrigger={refreshTrigger}
          />
        );
      
      case 'reports':
        return (
          <div className="bg-white shadow-lg rounded-xl p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Laporan DANUS</h3>
              <p className="text-gray-600">Pilih jenis laporan yang ingin Anda lihat</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ReportCard
                title="Laporan Laba Rugi"
                description="Ringkasan pemasukan dan pengeluaran"
                icon="📊"
                onClick={() => handleReportClick('profit-loss')}
              />
              <ReportCard
                title="Performa Unit"
                description="Analisis performa per unit usaha"
                icon="📈"
                onClick={() => handleReportClick('unit-performance')}
              />
              <ReportCard
                title="Transaksi Harian"
                description="Daftar transaksi harian"
                icon="📋"
                onClick={() => handleReportClick('daily-transactions')}
              />
              <ReportCard
                title="Analisis Trend"
                description="Analisis trend pemasukan dan pengeluaran"
                icon="📉"
                onClick={() => handleReportClick('trend-analysis')}
              />
              <ReportCard
                title="Laporan Bulanan"
                description="Ringkasan bulanan semua unit"
                icon="📅"
                onClick={() => handleReportClick('monthly-report')}
              />
              <ReportCard
                title="Laporan Tahunan"
                description="Ringkasan tahunan semua unit"
                icon="🗓️"
                onClick={() => handleReportClick('annual-report')}
              />
            </div>
          </div>
        );
      
      default:
        return <DanusDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DANA USAHA (DANUS)
              </h1>
              <p className="text-gray-600 mt-1">Manajemen unit usaha dan transaksi keuangan</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Status Sistem</div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50 rounded-t-lg'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-lg'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {renderTabContent()}
        </div>
      </div>

      {/* Modals */}
      <BusinessUnitForm
        unit={selectedBusinessUnit}
        isOpen={showBusinessUnitForm}
        onClose={() => {
          setShowBusinessUnitForm(false);
          setSelectedBusinessUnit(undefined);
        }}
        onSave={handleBusinessUnitSave}
      />

      <TransactionForm
        transaction={selectedTransaction}
        isOpen={showTransactionForm}
        onClose={() => {
          setShowTransactionForm(false);
          setSelectedTransaction(undefined);
        }}
        onSave={handleTransactionSave}
      />

      {/* Debug Panel */}
      <DebugPanel />
    </div>
  );
};

export default DanusPage;
