import React, { useState } from 'react';
import { 
  InformationCircleIcon,
  XMarkIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface QuickGuideProps {
  type: 'transaction' | 'attendance' | 'expense';
}

const QuickGuide: React.FC<QuickGuideProps> = ({ type }) => {
  const [isOpen, setIsOpen] = useState(false);

  const guides = {
    transaction: {
      title: 'Panduan Transaksi',
      items: [
        { icon: PlusCircleIcon, color: 'text-blue-500', label: 'Tambah', desc: 'Klik tombol "Tambah Transaksi" di kanan atas' },
        { icon: PencilSquareIcon, color: 'text-green-500', label: 'Edit', desc: 'Klik icon pensil di kolom Aksi' },
        { icon: TrashIcon, color: 'text-red-500', label: 'Hapus', desc: 'Klik icon tempat sampah di kolom Aksi' },
      ]
    },
    attendance: {
      title: 'Panduan Presensi Guru',
      items: [
        { icon: PlusCircleIcon, color: 'text-green-500', label: 'Upload', desc: 'Klik tombol "Upload Dokumen" untuk upload surat sakit/izin' },
        { icon: CheckCircleIcon, color: 'text-blue-500', label: 'Approve', desc: 'Klik icon centang hijau untuk menyetujui' },
        { icon: XMarkIcon, color: 'text-yellow-500', label: 'Reject', desc: 'Klik icon X kuning untuk menolak' },
        { icon: TrashIcon, color: 'text-red-500', label: 'Hapus', desc: 'Klik icon tempat sampah merah untuk menghapus' },
      ]
    },
    expense: {
      title: 'Panduan Upload Pengeluaran',
      items: [
        { icon: PlusCircleIcon, color: 'text-purple-500', label: 'Upload', desc: 'Klik tombol "Upload Dokumen" untuk upload FPU/Kuitansi' },
        { icon: CheckCircleIcon, color: 'text-blue-500', label: 'Approve', desc: 'Klik icon centang hijau untuk menyetujui dokumen' },
        { icon: XMarkIcon, color: 'text-yellow-500', label: 'Reject', desc: 'Klik icon X kuning untuk menolak dokumen' },
        { icon: TrashIcon, color: 'text-red-500', label: 'Hapus', desc: 'Klik icon tempat sampah merah (hanya pending)' },
      ]
    }
  };

  const guide = guides[type];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
      >
        <InformationCircleIcon className="w-5 h-5" />
        <span className="text-sm font-medium">Panduan</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h4 className="font-semibold text-gray-900">{guide.title}</h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            {guide.items.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <item.icon className={`w-6 h-6 ${item.color} flex-shrink-0`} />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickGuide;


