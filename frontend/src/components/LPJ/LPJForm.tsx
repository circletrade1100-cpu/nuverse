import React, { useState, useEffect, useRef } from 'react';
import { 
  XMarkIcon, 
  DocumentArrowUpIcon, 
  XCircleIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { lpjService } from '../../services/lpjService';
import { rapbsService } from '../../services/rapbsService';
import type { LPJ, LPJFormData } from '../../types/lpj';
import type { AcademicYear, RAPBSPlan } from '../../types/rapbs';

interface LPJFormProps {
  lpj?: LPJ | null;
  onClose: () => void;
  onSuccess: () => void;
}

const LPJForm: React.FC<LPJFormProps> = ({ lpj, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<LPJFormData>({
    academic_year_id: 0,
    unit_kerja_id: null,
    periode_type: 'semester',
    periode_start_date: '',
    periode_end_date: '',
    title: '',
    description: '',
    rapbs_plan_ids: [],
  });

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [availablePlans, setAvailablePlans] = useState<RAPBSPlan[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAcademicYears();
    if (lpj) {
      setFormData({
        academic_year_id: lpj.academic_year_id,
        unit_kerja_id: lpj.unit_kerja_id,
        periode_type: lpj.periode_type,
        periode_start_date: lpj.periode_start_date,
        periode_end_date: lpj.periode_end_date,
        title: lpj.title,
        description: lpj.description || '',
        rapbs_plan_ids: lpj.rapbs_plans?.map(p => p.rapbs_plan_id) || [],
      });
    }
  }, [lpj]);

  useEffect(() => {
    if (formData.academic_year_id) {
      loadAvailablePlans();
    }
  }, [formData.academic_year_id]);

  const loadAcademicYears = async () => {
    try {
      const response = await rapbsService.getAcademicYears({ status: 'active' });
      if (response.success && response.data) {
        setAcademicYears(response.data.data || []);
        if (response.data.data && response.data.data.length > 0 && !lpj) {
          setFormData(prev => ({ ...prev, academic_year_id: response.data.data[0].id }));
        }
      }
    } catch (error) {
      console.error('Error loading academic years:', error);
    }
  };

  const loadAvailablePlans = async () => {
    if (!formData.academic_year_id || formData.academic_year_id === 0) {
      setAvailablePlans([]);
      return;
    }

    try {
      setLoadingPlans(true);
      console.log('Loading available plans for academic year:', formData.academic_year_id);
      
      // Gunakan endpoint khusus LPJ untuk mendapatkan available plans
      // Endpoint ini lebih fleksibel dan mengembalikan semua approved plans yang relevan
      const response = await lpjService.getAvailablePlans(formData.academic_year_id);
      
      console.log('Response from getAvailablePlans:', response);
      
      if (response.success && response.data) {
        const plans = response.data || [];
        
        console.log('Available plans loaded successfully:', {
          total: plans.length,
          academic_year_id: formData.academic_year_id,
          plans: plans.slice(0, 5).map((p: RAPBSPlan) => ({ 
            id: p.id, 
            title: p.title, 
            status: p.status,
            unit_kerja: (p as any).unit_kerja?.nama || (p as any).unit_kerja?.name || 'N/A'
          }))
        });
        
        setAvailablePlans(plans);
      } else {
        console.warn('Failed to load plans - response not successful:', response);
        setAvailablePlans([]);
      }
    } catch (error: any) {
      console.error('Error loading plans:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url
      });
      setAvailablePlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const errors: string[] = [];
    const validFiles: File[] = [];

    files.forEach((file) => {
      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        errors.push(`${file.name}: Ukuran file maksimal 10 MB`);
        return;
      }

      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Format file tidak didukung. Gunakan PDF, Word, Excel, atau Image`);
        return;
      }

      validFiles.push(file);
    });

    setFileErrors(errors);
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.files = e.dataTransfer.files as any;
    const event = { target: input } as any;
    handleFileChange(event);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let lpjId = lpj?.id;
      
      if (lpj) {
        await lpjService.updateLPJ(lpj.id, formData);
        lpjId = lpj.id;
      } else {
        const response = await lpjService.createLPJ(formData);
        if (response.success && response.data) {
          lpjId = response.data.id;
        }
      }

      // Upload files if any
      if (selectedFiles.length > 0 && lpjId) {
        for (const file of selectedFiles) {
          // Determine document type based on file extension
          let docType: 'cover_letter' | 'legal_doc' | 'photo' | 'other' = 'other';
          if (file.type.startsWith('image/')) {
            docType = 'photo';
          } else if (file.name.toLowerCase().includes('surat') || file.name.toLowerCase().includes('cover')) {
            docType = 'cover_letter';
          } else if (file.name.toLowerCase().includes('legal') || file.name.toLowerCase().includes('izin')) {
            docType = 'legal_doc';
          }
          
          await lpjService.uploadDocument(lpjId, file, docType);
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving LPJ:', error);
      alert('Gagal menyimpan LPJ');
    } finally {
      setLoading(false);
    }
  };

  const togglePlan = (planId: number) => {
    setFormData(prev => {
      const currentIds = prev.rapbs_plan_ids || [];
      if (currentIds.includes(planId)) {
        return { ...prev, rapbs_plan_ids: currentIds.filter(id => id !== planId) };
      } else {
        return { ...prev, rapbs_plan_ids: [...currentIds, planId] };
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      approved: { label: 'Disetujui (Final)', color: 'bg-green-100 text-green-800' },
      approved_by_dirpen: { label: 'Disetujui Dirpen', color: 'bg-blue-100 text-blue-800' },
      approved_by_principal: { label: 'Disetujui Kepala Sekolah', color: 'bg-yellow-100 text-yellow-800' },
    };
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <DocumentArrowUpIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {lpj ? 'Edit LPJ' : 'Buat LPJ Baru'}
              </h2>
              <p className="text-teal-100 text-sm">Laporan Pertanggung Jawaban</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Informasi Dasar
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun Ajaran <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.academic_year_id > 0 ? formData.academic_year_id : ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, academic_year_id: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                >
                  <option value="">Pilih Tahun Ajaran</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>{year.year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Periode <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.periode_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, periode_type: e.target.value as 'semester' | 'tahunan' }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                >
                  <option value="semester">Semester</option>
                  <option value="tahunan">Tahunan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formData.periode_start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, periode_start_date: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors pr-10"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Selesai <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formData.periode_end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, periode_end_date: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors pr-10"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul LPJ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Contoh: LPJ Semester 1 Tahun Ajaran 2024/2025"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Masukkan deskripsi LPJ (opsional)"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* RAPBS Plans Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex-1">
                Pilih Rencana RAPBS
              </h3>
              <span className="text-xs text-gray-500 ml-2">
                (Kosongkan untuk auto-include semua yang approved)
              </span>
            </div>
            
            {loadingPlans ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Memuat rencana RAPBS...</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                {availablePlans.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">
                      Tidak ada rencana RAPBS yang sudah approved untuk tahun ajaran ini
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availablePlans.map(plan => (
                      <label 
                        key={plan.id} 
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.rapbs_plan_ids?.includes(plan.id)
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.rapbs_plan_ids?.includes(plan.id) || false}
                          onChange={() => togglePlan(plan.id)}
                          className="mt-1 w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-900">{plan.title}</p>
                            {getStatusBadge(plan.status)}
                          </div>
                          <div className="mt-1 space-y-1">
                            <p className="text-xs text-gray-600">
                              {plan.activity_category?.name} • {plan.funding_source?.name}
                            </p>
                            {(plan as any).unit_kerja && (
                              <p className="text-xs text-gray-500">
                                Unit: {(plan as any).unit_kerja.nama || (plan as any).unit_kerja.name}
                              </p>
                            )}
                            <p className="text-xs font-medium text-gray-700">
                              Anggaran: {formatCurrency(plan.planned_amount)}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Upload Dokumen Pendukung
            </h3>
            <p className="text-xs text-gray-500">
              (PDF, Word, Excel, Image - Max 10MB per file)
            </p>
            
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-400 transition-colors cursor-pointer bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Klik untuk upload atau drag & drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, Word, Excel, atau Image
              </p>
            </div>

            {fileErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                {fileErrors.map((error, index) => (
                  <p key={index} className="text-sm text-red-600">{error}</p>
                ))}
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <DocumentArrowUpIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                    >
                      <XCircleIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  {lpj ? 'Update' : 'Simpan'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LPJForm;
