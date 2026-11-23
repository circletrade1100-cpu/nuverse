import React from 'react';
import { X, User, MapPin, Phone, Mail, School, Calendar, Users } from 'lucide-react';
import type { Student } from '../../types/student';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  if (!isOpen || !student) return null;

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border border-gray-100">
        {/* Enhanced Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-700 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Detail Murid
                </h2>
                <p className="text-emerald-100">
                  Informasi lengkap data murid
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Photo & Basic Info Section */}
            <div className="xl:col-span-1">
              <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl p-6 border border-gray-200 text-center sticky top-8">
                <div className="w-56 h-56 mx-auto bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl mb-6">
                  {student.avatar ? (
                    <img
                      src={student.avatar}
                      alt={student.namaLengkap}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="w-24 h-24 text-emerald-400" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {student.namaLengkap}
                </h3>
                <p className="text-lg text-gray-600 mb-4">
                  "{student.namaPanggilan}"
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${
                    student.unitSekolah === 'TK' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                    student.unitSekolah === 'SD' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    student.unitSekolah === 'SMP' ? 'bg-green-100 text-green-800 border-green-200' :
                    'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {student.unitSekolah}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600 font-medium">
                    Kelas {student.unitKelas}
                  </span>
                </div>
              </div>
            </div>

            {/* Information Section */}
            <div className="xl:col-span-3">
              {/* Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <User className="w-6 h-6 mr-3 text-emerald-600" />
                      Informasi Pribadi
                    </h3>
                    
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Nama Lengkap
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {student.namaLengkap}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Nama Panggilan
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {student.namaPanggilan}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Tempat Lahir
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {student.tempatLahir}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Tanggal Lahir
                        </label>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-5 h-5 text-emerald-600" />
                          <p className="text-lg font-semibold text-gray-900">
                            {formatDate(student.tanggalLahir)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Usia: {calculateAge(student.tanggalLahir)} tahun
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Family Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <Users className="w-6 h-6 mr-3 text-blue-600" />
                      Informasi Keluarga
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Nama Ayah
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {student.namaAyah}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Nama Ibu
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {student.namaIbu}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Phone className="w-6 h-6 mr-3 text-purple-600" />
                  Informasi Kontak
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Phone className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Nomor HP
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {student.nomorHP}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {student.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg mt-1">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-500">
                        Alamat
                      </label>
                      <p className="text-lg font-semibold text-gray-900 leading-relaxed">
                        {student.alamat}
                      </p>
                    </div>
                  </div>
                  </div>

                  {/* School Information */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <School className="w-6 h-6 mr-3 text-orange-600" />
                      Informasi Sekolah
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Unit Sekolah
                        </label>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${
                            student.unitSekolah === 'TK' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            student.unitSekolah === 'SD' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            student.unitSekolah === 'SMP' ? 'bg-green-100 text-green-800 border-green-200' :
                            'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {student.unitSekolah}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Unit Kelas
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {student.unitKelas}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Login Information */}
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <User className="w-6 h-6 mr-3 text-indigo-600" />
                      Informasi Login
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          NISN
                        </label>
                        <p className="text-lg font-semibold text-gray-900 font-mono">
                          {student.nisn}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Nomor Induk Siswa Nasional
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Password
                        </label>
                        <p className="text-lg font-semibold text-gray-900 font-mono">
                          {'•'.repeat(student.password?.length || 8)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Password tersembunyi untuk keamanan
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps - Full Width */}
              {(student.createdAt || student.updatedAt) && (
                <div className="lg:col-span-2 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Informasi Sistem
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {student.createdAt && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Tanggal Dibuat
                        </label>
                        <p className="text-gray-700">
                          {formatDate(student.createdAt)}
                        </p>
                      </div>
                    )}
                    
                    {student.updatedAt && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Terakhir Diperbarui
                        </label>
                        <p className="text-gray-700">
                          {formatDate(student.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-8 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;
