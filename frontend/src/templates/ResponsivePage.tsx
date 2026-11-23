import React, { useState } from 'react';
import MainLayout from '../components/common/Layout/MainLayout';
import Modal from '../components/common/UI/Modal';
import Button from '../components/common/UI/Button';
import Card from '../components/common/UI/Card';

/**
 * Template halaman responsive yang otomatis menyesuaikan dengan semua ukuran layar dan zoom level
 * 
 * CARA PENGGUNAAN:
 * 1. Copy file ini sebagai halaman baru
 * 2. Rename komponen dan file sesuai kebutuhan
 * 3. Ganti konten di dalam ResponsiveContainer
 * 4. Semua styling sudah otomatis responsive
 */

interface ResponsivePageProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const ResponsivePage: React.FC<ResponsivePageProps> = ({ 
  title = "Halaman Baru",
  showBackButton = false,
  onBack 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <MainLayout>
      {/* Responsive Container - Otomatis menyesuaikan padding dan width */}
      <ResponsiveContainer>
        
        {/* Header Section */}
        <ResponsiveHeader 
          title={title}
          showBackButton={showBackButton}
          onBack={onBack}
        />

        {/* Content Grid - Otomatis responsive untuk desktop dan mobile */}
        <ResponsiveGrid>
          
          {/* Card Example */}
          <ResponsiveCard title="Contoh Card">
            <p className="text-slate-600">
              Konten card otomatis responsive. Ganti dengan konten Anda.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setIsModalOpen(true)}
              >
                Buka Modal
              </Button>
              <Button variant="secondary" size="sm">
                Aksi Lain
              </Button>
            </div>
          </ResponsiveCard>

          {/* Tambahkan card atau komponen lain di sini */}
          <ResponsiveCard title="Card Kedua">
            <p className="text-slate-600">
              Semua komponen menggunakan sistem responsive yang konsisten.
            </p>
          </ResponsiveCard>

        </ResponsiveGrid>

        {/* Floating Action Button untuk Mobile */}
        <ResponsiveFAB onClick={() => console.log('FAB clicked')} />

      </ResponsiveContainer>

      {/* Modal Example - Otomatis responsive dengan fixed buttons */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Modal Responsive"
        size="md"
      >
        <div className="modal-form-container">
          {/* Scrollable Content */}
          <div className="modal-form-content space-y-4">
            <p className="text-slate-600">
              Modal ini otomatis responsive dan tidak perlu zoom out.
            </p>
            
            {/* Form Example */}
            <ResponsiveForm />
          </div>

          {/* Fixed Bottom Actions */}
          <div className="modal-buttons-fixed">
            <div className="flex justify-end gap-3">
              <Button 
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Tutup
              </Button>
              <Button variant="primary">
                Konfirmasi
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

// Komponen Responsive Reusable

/**
 * Container utama yang otomatis responsive
 */
const ResponsiveContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full min-h-screen">
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {children}
    </div>
  </div>
);

/**
 * Header responsive dengan title dan back button
 */
interface ResponsiveHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({ 
  title, 
  showBackButton = false, 
  onBack,
  actions 
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
    <div className="flex items-center gap-3">
      {showBackButton && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          ←
        </Button>
      )}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">
          {title}
        </h1>
        <div className="w-12 sm:w-16 lg:w-20 h-1 bg-blue-500 rounded-full mt-1"></div>
      </div>
    </div>
    {actions && (
      <div className="flex items-center gap-2 sm:gap-3">
        {actions}
      </div>
    )}
  </div>
);

/**
 * Grid responsive yang otomatis menyesuaikan kolom
 */
const ResponsiveGrid: React.FC<{ children: React.ReactNode; columns?: number }> = ({ 
  children, 
  columns = 2 
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols] || gridCols[2]} gap-4 sm:gap-6`}>
      {children}
    </div>
  );
};

/**
 * Card responsive dengan padding dan spacing otomatis
 */
interface ResponsiveCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({ 
  title, 
  children, 
  className = "",
  actions 
}) => (
  <Card className={`h-fit ${className}`}>
    {title && (
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-slate-800">
          {title}
        </h3>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    )}
    <div className="space-y-3 sm:space-y-4">
      {children}
    </div>
  </Card>
);

/**
 * Floating Action Button untuk mobile
 */
interface ResponsiveFABProps {
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const ResponsiveFAB: React.FC<ResponsiveFABProps> = ({ 
  onClick, 
  icon = "+", 
  className = "" 
}) => (
  <button
    onClick={onClick}
    className={`
      fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8
      w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16
      bg-blue-500 hover:bg-blue-600 
      text-white text-xl font-bold
      rounded-full shadow-lg hover:shadow-xl
      transition-all duration-200 transform hover:scale-105
      z-50 lg:hidden
      ${className}
    `}
  >
    {icon}
  </button>
);

/**
 * Form responsive dengan input fields yang menyesuaikan ukuran layar
 * Tombol submit/batal sudah dipindah ke fixed bottom modal
 */
const ResponsiveForm: React.FC = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Nama <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
          placeholder="Masukkan nama"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Email
        </label>
        <input
          type="email"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
          placeholder="Masukkan email"
        />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Deskripsi
      </label>
      <textarea
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 h-24 resize-none"
        placeholder="Masukkan deskripsi"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Kategori
      </label>
      <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800">
        <option value="">Pilih kategori</option>
        <option value="option1">Kategori 1</option>
        <option value="option2">Kategori 2</option>
      </select>
    </div>
  </div>
);

// Export semua komponen untuk digunakan di halaman lain
export default ResponsivePage;
export { 
  ResponsiveContainer, 
  ResponsiveHeader, 
  ResponsiveGrid, 
  ResponsiveCard,
  ResponsiveFAB,
  ResponsiveForm
};
