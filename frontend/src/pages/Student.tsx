import React, { useState, useEffect } from 'react';
import { Plus, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Student, StudentFormData } from '../types/student';
import StudentFormModal from '../components/Student/StudentFormModal';
import StudentDataTable from '../components/Student/StudentDataTable';
import StudentDetailModal from '../components/Student/StudentDetailModal';
import StudentImportModal from '../components/Student/StudentImportModal';
import { studentService } from '../services/studentService';


const StudentPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage] = useState(10);
  const [studentStats, setStudentStats] = useState({
    TK: 0,
    SD: 0,
    SMP: 0,
    SMA: 0,
  });
  const [filters, setFilters] = useState({
    nama: '',
    unitSekolah: '',
    unitKelas: '',
  });

  useEffect(() => {
    fetchStudentStatistics();
    setCurrentPage(1); // Reset ke halaman 1 saat pertama load
  }, []);

  // Reset ke halaman 1 ketika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.nama, filters.unitSekolah, filters.unitKelas]);

  useEffect(() => {
    fetchStudents(currentPage);
  }, [currentPage, filters]);

  const fetchStudentStatistics = async () => {
    try {
      const stats = await studentService.getStatistics();
      setStudentStats(stats.by_unit_sekolah);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchStudents = async (page: number = 1) => {
    try {
      setLoading(true);
      const { students, total } = await studentService.getAll({ per_page: itemsPerPage, page, ...filters });
      setStudents(students);
      setTotalStudents(total || 0);
      setTotalPages(Math.ceil((total || 0) / itemsPerPage));
      if (!hasLoadedOnce) {
        setHasLoadedOnce(true);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Gagal memuat data murid');
    } finally {
      setLoading(false);
    }
  };

  const handleImportJson = async (jsonData: any[]) => {
    try {
      const result = await studentService.importFromJson(jsonData);
      console.log('Import JSON result:', result);
      
      if (result.success) {
        const imported = result.imported || 0;
        const updated = result.updated || 0;
        const skipped = result.skipped || 0;
        let message = `Import selesai: ${imported} data baru`;
        if (updated > 0) {
          message += `, ${updated} data diperbarui`;
        }
        if (skipped > 0) {
          message += ` (${skipped} data dilewati)`;
        }
        toast.success(message);
        
        // Tampilkan error detail jika ada data yang dilewati
        if (skipped > 0 && result.errors && result.errors.length > 0) {
          console.warn('Import JSON errors:', result.errors);
          
          const errorDetails = result.errors.slice(0, 10).join('\n');
          const moreErrors = result.errors.length > 10 ? `\n... dan ${result.errors.length - 10} error lainnya` : '';
          
          console.group('📋 Detail Error Import JSON:');
          result.errors.forEach((err, idx) => {
            console.error(`${idx + 1}. ${err}`);
          });
          console.groupEnd();
          
          alert(`⚠️ ${skipped} data dilewati!\n\nDetail error:\n${errorDetails}${moreErrors}\n\nCek console browser (F12) untuk detail lengkap.`);
        }
        
        await fetchStudents();
        await fetchStudentStatistics();
      } else {
        toast.error(result.message || 'Gagal import data murid dari JSON');
        if (result.errors && result.errors.length > 0) {
          console.error('Import JSON errors:', result.errors);
          alert(`Gagal import:\n${result.errors.slice(0, 5).join('\n')}`);
        }
      }
    } catch (error: any) {
      console.error('Import JSON error:', error);
      toast.error(error.message || 'Gagal import data murid dari JSON');
      throw error;
    }
  };

  const handleImportExcel = async (file: File) => {
    try {
      const result = await studentService.importFromFile(file);
      console.log('Import result:', result);
      
      if (result.success) {
        const imported = result.imported || 0;
        const updated = (result as { updated?: number }).updated || 0;
        const skipped = result.skipped || 0;
        let message = `Import selesai: ${imported} data baru`;
        if (updated > 0) {
          message += `, ${updated} data diperbarui`;
        }
        if (skipped > 0) {
          message += ` (${skipped} data dilewati)`;
        }
        toast.success(message);
        
        // Tampilkan error detail jika ada data yang dilewati
        if (skipped > 0 && result.errors && result.errors.length > 0) {
          console.warn('Import errors:', result.errors);
          console.warn('Debug info:', result.debug);
          
          // Tampilkan error detail di console dan alert untuk debugging
          const errorDetails = result.errors.slice(0, 10).join('\n'); // Tampilkan 10 error pertama
          const moreErrors = result.errors.length > 10 ? `\n... dan ${result.errors.length - 10} error lainnya` : '';
          
          // Tampilkan di console untuk developer
          console.group('📋 Detail Error Import:');
          result.errors.forEach((err, idx) => {
            console.error(`${idx + 1}. ${err}`);
          });
          if (result.debug) {
            console.log('🔍 Debug Info:', result.debug);
            if (result.debug.header_mapping) {
              console.table(result.debug.header_mapping);
            }
          }
          console.groupEnd();
          
          // Tampilkan alert untuk user dengan detail error
          alert(`⚠️ ${skipped} data dilewati!\n\nDetail error:\n${errorDetails}${moreErrors}\n\nCek console browser (F12) untuk detail lengkap.`);
        }
        
        await fetchStudents(); // Refresh data
        await fetchStudentStatistics(); // Refresh statistics
      } else {
        toast.error(result.message || 'Gagal import data murid');
        if (result.errors && result.errors.length > 0) {
          console.error('Import errors:', result.errors);
          alert(`Gagal import:\n${result.errors.slice(0, 5).join('\n')}`);
        }
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Gagal import data murid');
      throw error;
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsFormModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    console.log('Editing student:', student);
    const formData = convertStudentToFormData(student);
    console.log('Converted form data:', formData);
    setEditingStudent(student);
    setIsFormModalOpen(true);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data murid ini?')) {
      try {
        const success = await studentService.delete(studentId);
        if (success) {
          toast.success('Data murid berhasil dihapus');
          await fetchStudents(); // Refresh data
        } else {
          toast.error('Gagal menghapus data murid');
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Gagal menghapus data murid');
      }
    }
  };

  const handleViewStudent = (student: Student) => {
    setViewingStudent(student);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = async (formData: StudentFormData) => {
    try {
      console.log('handleFormSubmit called with:', {
        isEdit: !!editingStudent,
        editingStudentId: editingStudent?.id,
        formData: formData
      });

      let result;
      if (editingStudent) {
        // Update existing student
        console.log('Updating student with ID:', editingStudent.id);
        console.log('📤 Sending formData to update service:', {
          ...formData,
          avatar: formData.avatar ? `File: ${formData.avatar.name}` : 'No avatar'
        });
        result = await studentService.update(editingStudent.id, formData);
        console.log('Student updated successfully:', result);
        toast.success('Data murid berhasil diperbarui');
      } else {
        // Add new student
        console.log('Creating new student');
        result = await studentService.create(formData);
        console.log('Student created successfully:', result);
        toast.success('Data murid berhasil ditambahkan');
      }
      
      // Close modal and reset form after successful submission
      setIsFormModalOpen(false);
      setEditingStudent(null);
      
      // Refresh data to show the new/updated student
      await fetchStudents();
      console.log('✅ Data refreshed after successful submission');
      
      return result;
    } catch (error: any) {
      console.error('Error saving student:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.message || 'Gagal menyimpan data murid');
      throw error;
    }
  };

  const convertStudentToFormData = (student: Student): StudentFormData => {
    return {
      namaLengkap: student.namaLengkap,
      namaPanggilan: student.namaPanggilan,
      tempatLahir: student.tempatLahir,
      tanggalLahir: student.tanggalLahir,
      namaIbu: student.namaIbu,
      namaAyah: student.namaAyah,
      nomorHP: student.nomorHP,
      alamat: student.alamat,
      email: student.email,
      unitSekolah: student.unitSekolah,
      unitKelas: student.unitKelas,
      nisn: student.nisn,
      password: student.password,
      avatar: null,
    };
  };

  // Use statistics from backend (not dependent on pagination)
  const studentsBySchool = studentStats;

  if (!hasLoadedOnce && loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Memuat data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto p-6">
        {loading && hasLoadedOnce && (
          <div className="fixed z-40 top-6 right-6 flex items-center space-x-3 px-4 py-2 bg-white/95 border border-emerald-100 shadow-xl rounded-full">
            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-emerald-700">Memperbarui data murid...</span>
          </div>
        )}
        {/* Enhanced Page Header */}
        <div className="mb-8">
          {/* Header Background with Gradient */}
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-700 rounded-2xl shadow-xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            </div>
            
            <div className="relative px-8 py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                      Data Murid
                    </h1>
                    <p className="text-emerald-100 text-lg">
                      Kelola data murid dan informasi pendidikan dengan mudah
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-emerald-700 bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300"
                  >
                    <span>Import Excel</span>
                  </button>
                  
                  <button
                    onClick={handleAddStudent}
                    className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Murid</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="group relative bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Murid</p>
                  <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    ↗ +8% dari bulan lalu
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-emerald-100 rounded-full opacity-20"></div>
          </div>
          
          <div className="group relative bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">TK</p>
                  <p className="text-3xl font-bold text-gray-900">{studentsBySchool.TK}</p>
                  <p className="text-xs text-purple-600 font-medium mt-1">
                    Taman Kanak-kanak
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-purple-100 rounded-full opacity-20"></div>
          </div>
          
          <div className="group relative bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">SD</p>
                  <p className="text-3xl font-bold text-gray-900">{studentsBySchool.SD}</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    Sekolah Dasar
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-blue-100 rounded-full opacity-20"></div>
          </div>
          
          <div className="group relative bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">SMP</p>
                  <p className="text-3xl font-bold text-gray-900">{studentsBySchool.SMP}</p>
                  <p className="text-xs text-amber-600 font-medium mt-1">
                    Sekolah Menengah Pertama
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-amber-100 rounded-full opacity-20"></div>
          </div>
          
          <div className="group relative bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">SMA</p>
                  <p className="text-3xl font-bold text-gray-900">{studentsBySchool.SMA}</p>
                  <p className="text-xs text-red-600 font-medium mt-1">
                    Sekolah Menengah Atas
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-red-100 rounded-full opacity-20"></div>
          </div>
        </div>

        {/* Data Table */}
        <StudentDataTable
          students={students}
          onImportExcel={handleImportExcel}
          onEditStudent={handleEditStudent}
          onDeleteStudent={handleDeleteStudent}
          onViewStudent={handleViewStudent}
          totalItems={totalStudents}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          totalPages={totalPages}
          filters={filters}
          onFilterChange={setFilters}
        />

        {/* Import Modal */}
        <StudentImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportExcel}
          onImportJson={handleImportJson}
        />

        {/* Student Form Modal */}
        <StudentFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingStudent(null);
          }}
          onSubmit={handleFormSubmit}
          isEdit={!!editingStudent}
          initialData={editingStudent ? convertStudentToFormData(editingStudent) : undefined}
          editingStudent={editingStudent || undefined}
        />

        {/* Student Detail Modal */}
        <StudentDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setViewingStudent(null);
          }}
          student={viewingStudent}
        />
      </div>
    </div>
  );
};

export default StudentPage;
