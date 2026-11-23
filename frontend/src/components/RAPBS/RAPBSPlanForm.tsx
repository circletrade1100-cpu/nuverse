import React, { useEffect, useState } from 'react';
import { XMarkIcon, DocumentArrowUpIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { rapbsService } from '../../services/rapbsService';
import type { RAPBSPlan, PlanFormData, AcademicYear, ActivityCategory, FundingSource } from '../../types/rapbs';

interface RAPBSPlanFormProps {
  plan?: RAPBSPlan;
  onClose: () => void;
  onSave: () => void;
}

const RAPBSPlanForm: React.FC<RAPBSPlanFormProps> = ({ plan, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  
  const [formData, setFormData] = useState<PlanFormData>({
    academic_year_id: plan?.academic_year_id || 0,
    activity_category_id: plan?.activity_category_id || 0,
    funding_source_id: plan?.funding_source_id || 0,
    title: plan?.title || '',
    description: plan?.description || '',
    planned_amount: plan?.planned_amount || 0,
    priority: plan?.priority || 'medium',
  });
  const [proposalFiles, setProposalFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [yearsRes, categoriesRes, sourcesRes] = await Promise.all([
        rapbsService.getAcademicYears({ status: 'active' }),
        rapbsService.getActivityCategories(),
        rapbsService.getFundingSources({ status: 'active' }),
      ]);

      if (yearsRes.success) setAcademicYears(yearsRes.data?.data || []);
      if (categoriesRes.success) setCategories(categoriesRes.data?.data || []);
      if (sourcesRes.success) setFundingSources(sourcesRes.data?.data || []);
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const errors: string[] = [];
    const validFiles: File[] = [];

    files.forEach((file) => {
      // Check file type
      if (file.type !== 'application/pdf') {
        errors.push(`${file.name}: Hanya file PDF yang diperbolehkan`);
        return;
      }

      // Check file size (max 5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        errors.push(`${file.name}: Ukuran file maksimal 5 MB`);
        return;
      }

      validFiles.push(file);
    });

    setFileErrors(errors);
    setProposalFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setProposalFiles((prev) => prev.filter((_, i) => i !== index));
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
    
    // Validate proposal files for new plans
    if (!plan && proposalFiles.length === 0) {
      alert('Minimal 1 file proposal harus diupload');
      return;
    }

    setLoading(true);

    try {
      if (plan) {
        await rapbsService.updatePlan(plan.id, formData, proposalFiles.length > 0 ? proposalFiles : undefined);
      } else {
        await rapbsService.createPlan(formData, proposalFiles);
      }
      onSave();
    } catch (error: any) {
      console.error('Error saving plan:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menyimpan rencana';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrencyInput = (value: number): string => {
    if (!value) return '';
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const parseCurrencyInput = (value: string): number => {
    if (!value) return 0;
    const cleanValue = value.replace(/[^\d]/g, '');
    return parseInt(cleanValue) || 0;
  };

  const handleCurrencyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseCurrencyInput(value);
    
    setFormData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('_id') ? Number(value) : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">
            {plan ? 'Edit Rencana RAPBS' : 'Tambah Rencana RAPBS'}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-500 rounded-lg p-1 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Tahun Ajaran */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tahun Ajaran <span className="text-red-500">*</span>
              </label>
              <select
                name="academic_year_id"
                value={formData.academic_year_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih Tahun Ajaran</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.year}
                  </option>
                ))}
              </select>
            </div>

            {/* Kategori Kegiatan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori Kegiatan <span className="text-red-500">*</span>
              </label>
              <select
                name="activity_category_id"
                value={formData.activity_category_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.budget_type === 'income' ? 'Pemasukan' : 'Pengeluaran'})
                  </option>
                ))}
              </select>
            </div>

            {/* Sumber Dana */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sumber Dana <span className="text-red-500">*</span>
              </label>
              <select
                name="funding_source_id"
                value={formData.funding_source_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih Sumber Dana</option>
                {fundingSources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Judul */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Rencana <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan judul rencana"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan deskripsi rencana"
              />
            </div>

            {/* Anggaran */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Anggaran <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  Rp
                </span>
                <input
                  type="text"
                  name="planned_amount"
                  value={formData.planned_amount ? formatCurrencyInput(formData.planned_amount) : ''}
                  onChange={handleCurrencyInputChange}
                  required
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Upload Proposal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Proposal <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="file"
                    id="proposal-files"
                    accept=".pdf,application/pdf"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="proposal-files"
                    className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <DocumentArrowUpIcon className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">
                      Pilih file PDF (maksimal 5 MB per file)
                    </span>
                  </label>
                </div>

                {/* File Errors */}
                {fileErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-800 mb-1">Error:</p>
                    <ul className="text-xs text-red-700 space-y-1">
                      {fileErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Selected Files List */}
                {proposalFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 font-medium">
                      File yang dipilih ({proposalFiles.length}):
                    </p>
                    <div className="space-y-2">
                      {proposalFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <DocumentArrowUpIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="ml-3 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Hapus file"
                          >
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  * Format: PDF | Ukuran maksimal: 5 MB per file | Multiple upload diperbolehkan
                </p>
              </div>
            </div>

            {/* Prioritas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioritas <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : plan ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RAPBSPlanForm;

