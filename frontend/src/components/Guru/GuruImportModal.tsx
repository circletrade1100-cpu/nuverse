import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';

interface GuruImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
}

const GuruImportModal: React.FC<GuruImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Format file tidak didukung. Gunakan file Excel (.xlsx, .xls) atau CSV (.csv)');
      setImportStatus('error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setErrorMessage('Ukuran file terlalu besar. Maksimal 10MB.');
      setImportStatus('error');
      return;
    }

    setSelectedFile(file);
    setImportStatus('idle');
    setErrorMessage('');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImportStatus('uploading');
    try {
      await onImport(selectedFile);
      setImportStatus('success');
      setTimeout(() => {
        onClose();
        resetModal();
      }, 2000);
    } catch (error) {
      setImportStatus('error');
      setErrorMessage('Gagal mengimpor data. Periksa format file dan coba lagi.');
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setImportStatus('idle');
    setErrorMessage('');
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    // Template Excel structure
    const csvContent = [
      'Nama Lengkap,NIP,Jabatan,Status,TMT,Unit Kerja,Tempat Lahir,Tanggal Lahir,Jenjang Pendidikan,Jurusan,Status Pernikahan,Tugas Tambahan,Mapel Diampu,Jam Mengajar',
      'John Doe,123456789012345678,Guru,Aktif,2020-01-15,SMP Negeri 1,Jakarta,1985-05-20,S1,Matematika,Menikah,Koordinator Matematika,Matematika;Fisika,24',
      'Jane Smith,987654321098765432,Guru,Aktif,2019-08-01,SMP Negeri 1,Bandung,1987-03-10,S1,Bahasa Indonesia,Belum Menikah,,Bahasa Indonesia,18'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_data_guru.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Import Data Guru</h2>
          <button
            onClick={() => {
              onClose();
              resetModal();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Download Template */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900">Template Excel</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Download template untuk memastikan format data sesuai dengan sistem.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center space-x-2 mt-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Template</span>
                </button>
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File Excel
            </label>
            
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : selectedFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="text-center">
                {selectedFile ? (
                  <div className="flex items-center justify-center space-x-2">
                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">{selectedFile.name}</p>
                      <p className="text-sm text-green-700">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-900">
                        Klik untuk upload atau drag & drop file
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Excel (.xlsx, .xls) atau CSV (.csv), maksimal 10MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {importStatus === 'error' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            </div>
          )}

          {importStatus === 'success' && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-800">Data berhasil diimpor!</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Petunjuk Import:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Gunakan template yang sudah disediakan</li>
              <li>• Pastikan semua kolom wajib diisi</li>
              <li>• Format tanggal: YYYY-MM-DD (contoh: 2020-01-15)</li>
              <li>• Untuk multiple mapel, pisahkan dengan titik koma (;)</li>
              <li>• NIP harus unik dan 18 digit</li>
              <li>• Status: Aktif, Non-Aktif, atau Pensiun</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => {
              onClose();
              resetModal();
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedFile || importStatus === 'uploading'}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {importStatus === 'uploading' && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>
              {importStatus === 'uploading' ? 'Mengimpor...' : 'Import Data'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuruImportModal;
