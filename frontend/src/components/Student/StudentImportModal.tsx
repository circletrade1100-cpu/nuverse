import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle, FileJson } from 'lucide-react';

interface StudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
  onImportJson?: (jsonData: any[]) => Promise<void>;
}

const StudentImportModal: React.FC<StudentImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  onImportJson,
}) => {
  const [importType, setImportType] = useState<'excel' | 'json'>('excel');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
    
    const files = Array.from(e.dataTransfer.files);
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Format file tidak didukung. Gunakan file Excel (.xlsx, .xls) atau CSV (.csv)');
      setImportStatus('error');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Ukuran file terlalu besar. Maksimal 10MB');
      setImportStatus('error');
      return;
    }

    setSelectedFile(file);
    setImportStatus('idle');
    setErrorMessage('');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImport = async () => {
    if (importType === 'excel') {
      if (!selectedFile) return;

      setImporting(true);
      setImportStatus('idle');
      setErrorMessage('');

      try {
        await onImport(selectedFile);
        setImportStatus('success');
        setTimeout(() => {
          handleClose();
        }, 2000);
      } catch (error) {
        setImportStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Terjadi kesalahan saat import data');
      } finally {
        setImporting(false);
      }
    } else {
      // JSON import
      if (!jsonData.trim()) {
        setErrorMessage('JSON data tidak boleh kosong');
        setImportStatus('error');
        return;
      }

      if (!onImportJson) {
        setErrorMessage('Import JSON tidak tersedia');
        setImportStatus('error');
        return;
      }

      setImporting(true);
      setImportStatus('idle');
      setErrorMessage('');

      try {
        const parsed = JSON.parse(jsonData);
        if (!Array.isArray(parsed)) {
          throw new Error('JSON harus berupa array');
        }
        await onImportJson(parsed);
        setImportStatus('success');
        setTimeout(() => {
          handleClose();
        }, 2000);
      } catch (error) {
        setImportStatus('error');
        if (error instanceof SyntaxError) {
          setErrorMessage('Format JSON tidak valid: ' + error.message);
        } else {
          setErrorMessage(error instanceof Error ? error.message : 'Terjadi kesalahan saat import data');
        }
      } finally {
        setImporting(false);
      }
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setJsonData('');
    setImportType('excel');
    setImporting(false);
    setImportStatus('idle');
    setErrorMessage('');
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const downloadJsonTemplate = () => {
    const template = [
      {
        nama_lengkap: "Ahmad Fauzi",
        nama_panggilan: "Ahmad",
        nisn: "1234567890",
        tempat_lahir: "Jakarta",
        tanggal_lahir: "2008-05-15",
        nama_ibu: "Siti Nurhaliza",
        nama_ayah: "Fauzi Rahman",
        nomor_hp: "081234567890",
        alamat: "Jl. Merdeka No. 123 Jakarta",
        email: "ahmad.fauzi@example.com",
        unit_sekolah: "SMP",
        unit_kelas: "7A",
        password: "password123",
        status: "Aktif"
      },
      {
        nama_lengkap: "Siti Aisyah",
        nama_panggilan: "Siti",
        nisn: "0987654321",
        tempat_lahir: "Bandung",
        tanggal_lahir: "2009-03-20",
        nama_ibu: "Rahayu Sari",
        nama_ayah: "Ahmad Hidayat",
        nomor_hp: "081987654321",
        alamat: "Jl. Sudirman No. 45 Bandung",
        email: "siti.aisyah@example.com",
        unit_sekolah: "SMP",
        unit_kelas: "7B",
        password: "password123",
        status: "Aktif"
      }
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_data_murid.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTemplate = () => {
    // Template Excel structure untuk Student
    const csvContent = [
      'Nama Lengkap,Nama Panggilan,NISN,Tempat Lahir,Tanggal Lahir,Nama Ibu,Nama Ayah,Nomor HP,Alamat,Email,Unit Sekolah,Unit Kelas,Password,Status',
      'Ahmad Fauzi,Ahmad,Jakarta,2008-05-15,Siti Nurhaliza,Fauzi Rahman,081234567890,Jl. Merdeka No. 123 Jakarta,ahmad.fauzi@example.com,SMP,7A,password123,Aktif',
      'Siti Aisyah,Siti,Bandung,2009-03-20,Rahayu Sari,Ahmad Hidayat,081987654321,Jl. Sudirman No. 45 Bandung,siti.aisyah@example.com,SMP,7B,password123,Aktif'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_data_murid.csv');
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-100">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-700 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Import Data Murid
                </h2>
                <p className="text-emerald-100">
                  Upload file Excel, CSV, atau JSON untuk import data murid
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={importing}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Import Type Tabs */}
          <div className="mb-6">
            <div className="flex space-x-2 border-b border-gray-200">
              <button
                onClick={() => {
                  setImportType('excel');
                  setSelectedFile(null);
                  setJsonData('');
                  setErrorMessage('');
                  setImportStatus('idle');
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  importType === 'excel'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel / CSV</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setImportType('json');
                  setSelectedFile(null);
                  setErrorMessage('');
                  setImportStatus('idle');
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  importType === 'json'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileJson className="w-4 h-4" />
                  <span>JSON</span>
                </div>
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Panduan Import
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              {importType === 'excel' ? (
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• File harus berformat Excel (.xlsx, .xls) atau CSV (.csv)</li>
                  <li>• Maksimal ukuran file 10MB</li>
                  <li>• Kolom yang diperlukan: Nama Lengkap, Nama Panggilan, Tempat Lahir, Tanggal Lahir, dll.</li>
                  <li>• Gunakan template yang disediakan untuk format yang benar</li>
                </ul>
              ) : (
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Data harus berupa array JSON yang valid</li>
                  <li>• Setiap item harus memiliki field: nama_lengkap, nisn, email, dll.</li>
                  <li>• Field dapat menggunakan camelCase (namaLengkap) atau snake_case (nama_lengkap)</li>
                  <li>• Gunakan template yang disediakan untuk format yang benar</li>
                </ul>
              )}
            </div>
          </div>

          {/* Download Template */}
          <div className="mb-6">
            <div className="flex space-x-2">
              {importType === 'excel' ? (
                <button 
                  onClick={downloadTemplate}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Template Excel</span>
                </button>
              ) : (
                <button 
                  onClick={downloadJsonTemplate}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Template JSON</span>
                </button>
              )}
            </div>
          </div>

          {/* File Upload Area / JSON Input */}
          {importType === 'excel' ? (
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-emerald-400 bg-emerald-50'
                  : selectedFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50'
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
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={importing}
              />

              {selectedFile ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-green-800">
                      File Terpilih
                    </h4>
                    <p className="text-green-600 font-medium">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-green-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                    disabled={importing}
                  >
                    Hapus file
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Drag & drop file di sini
                    </h4>
                    <p className="text-gray-600">
                      atau klik untuk memilih file
                    </p>
                    <p className="text-sm text-gray-500">
                      Excel (.xlsx, .xls) atau CSV (.csv), maks 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste atau ketik JSON data di sini:
              </label>
              <textarea
                value={jsonData}
                onChange={(e) => {
                  setJsonData(e.target.value);
                  setErrorMessage('');
                  setImportStatus('idle');
                }}
                placeholder='[{"nama_lengkap": "Ahmad Fauzi", "nisn": "1234567890", "email": "ahmad@example.com", ...}]'
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
                disabled={importing}
              />
              {jsonData && (
                <div className="mt-2 text-sm text-gray-500">
                  {(() => {
                    try {
                      const parsed = JSON.parse(jsonData);
                      if (Array.isArray(parsed)) {
                        return `✓ Valid JSON array dengan ${parsed.length} item`;
                      } else {
                        return '⚠ JSON harus berupa array';
                      }
                    } catch {
                      return '⚠ Format JSON tidak valid';
                    }
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Status Messages */}
          {importStatus === 'success' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-800">
                    Import Berhasil!
                  </h4>
                  <p className="text-sm text-green-600">
                    Data murid berhasil diimport ke sistem
                  </p>
                </div>
              </div>
            </div>
          )}

          {importStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h4 className="font-semibold text-red-800">
                    Import Gagal
                  </h4>
                  <p className="text-sm text-red-600">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={importing}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleImport}
              disabled={(importType === 'excel' && !selectedFile) || (importType === 'json' && !jsonData.trim()) || importing || importStatus === 'success'}
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-xl hover:from-emerald-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {importing && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>
                {importing ? 'Mengimport...' : 'Import Data'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentImportModal;
