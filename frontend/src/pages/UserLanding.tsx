import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  ChevronRight, 
  School,
  ArrowRight,
  Clock,
  MessageCircle,
  FileText,
  CreditCard,
  Settings,
  Database,
  BarChart3,
  DollarSign
} from 'lucide-react';

const UserLanding: React.FC = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role: 'guru' | 'parent' | 'admin') => {
    if (role === 'admin') {
      navigate('/login');
    } else {
      navigate(`/${role}/login`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]">
          <div className="absolute top-20 left-10 w-32 h-32 border border-blue-300 rounded-full"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border border-green-300 rounded-full"></div>
          <div className="absolute bottom-32 left-20 w-20 h-20 border border-orange-300 rounded-full"></div>
          <div className="absolute bottom-20 right-10 w-28 h-28 border border-purple-300 rounded-full"></div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header Section */}
        <div className="pt-8 pb-12">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center">
              {/* Logo */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-6 shadow-lg">
                <img 
                  src="/logo-annur.png" 
                  alt="Logo Annur" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              
              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                NURVERSE <span className="text-blue-600">ID</span>
              </h1>
              <p className="text-gray-600 text-base md:text-lg mb-2">YPI An-Nur Cikarang</p>
              
              {/* Subtitle */}
              <div className="mt-6 mb-8">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">
                ٱلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ ٱللَّٰهِ وَبَرَكَاتُهُ 
                </h2>
                <p className="text-gray-600 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                  Silakan pilih portal yang sesuai dengan peran Anda untuk mengakses Salam Annur
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pb-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
              {/* Portal Guru */}
              <div className="group">
                <button
                  onClick={() => handleRoleSelection('guru')}
                  className="w-full text-left h-full"
                >
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 group-hover:border-green-300 group-hover:-translate-y-1 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                          <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">Portal Guru</h3>
                          <p className="text-gray-600 text-sm">Tenaga Pendidik</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors flex-shrink-0" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-6 flex-1">
                      <div className="flex items-center space-x-2 p-2 rounded-lg bg-green-50">
                        <Clock className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 text-xs font-medium">Absensi</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-lg bg-green-50">
                        <CreditCard className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 text-xs font-medium">Payroll</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-lg bg-green-50">
                        <MessageCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 text-xs font-medium">Komunikasi</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-lg bg-green-50">
                        <FileText className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 text-xs font-medium">Laporan</span>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-auto">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 font-semibold text-sm mb-1">Masuk sebagai Guru</p>
                          <p className="text-gray-500 text-xs">Kelola data akademik & administrasi</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-green-600 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Portal Orang Tua */}
              <div className="group">
                <button
                  onClick={() => handleRoleSelection('parent')}
                  className="w-full text-left h-full"
                >
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 group-hover:border-orange-300 group-hover:-translate-y-1 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">Portal Orang Tua</h3>
                          <p className="text-gray-600 text-sm">Wali Murid</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors flex-shrink-0" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-6 flex-1">
                      <div className="flex items-center space-x-2 p-2 rounded-lg bg-orange-50">
                        <FileText className="w-3 h-3 text-orange-600 flex-shrink-0" />
                        <span className="text-gray-700 text-xs font-medium">Tagihan</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-lg bg-orange-50">
                        <Clock className="w-3 h-3 text-orange-600 flex-shrink-0" />
                        <span className="text-gray-700 text-xs font-medium">Absensi Anak</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-lg bg-orange-50">
                        <MessageCircle className="w-3 h-3 text-orange-600 flex-shrink-0" />
                        <span className="text-gray-700 text-xs font-medium">Komunikasi</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-lg bg-orange-50">
                        <GraduationCap className="w-3 h-3 text-orange-600 flex-shrink-0" />
                        <span className="text-gray-700 text-xs font-medium">Akademik</span>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-auto">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-600 font-semibold text-sm mb-1">Masuk sebagai Orang Tua</p>
                          <p className="text-gray-500 text-xs">Pantau perkembangan anak</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-orange-600 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Portal Manajemen */}
              <div className="group">
                <button
                  onClick={() => handleRoleSelection('admin')}
                  className="w-full text-left h-full"
                >
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 group-hover:border-indigo-300 group-hover:-translate-y-1 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                          <Settings className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">Portal Manajemen</h3>
                          <p className="text-gray-600 text-sm">Admin & Staff</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-6 flex-1">
                      <div className="flex items-center space-x-2 p-2 rounded-lg bg-indigo-50">
                        <BarChart3 className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                        <span className="text-gray-700 text-xs font-medium">Akuntansi</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-lg bg-indigo-50">
                        <Database className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                        <span className="text-gray-700 text-xs font-medium">Tata Usaha</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-lg bg-indigo-50">
                        <DollarSign className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                        <span className="text-gray-700 text-xs font-medium">Payroll</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-lg bg-indigo-50">
                        <FileText className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                        <span className="text-gray-700 text-xs font-medium">RAPBS</span>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-auto">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-indigo-600 font-semibold text-sm mb-1">Masuk sebagai Admin</p>
                          <p className="text-gray-500 text-xs">Kelola sistem manajemen sekolah</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-white/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <School className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-700">YPI NURRAHIM ANNUR</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Sistem Manajemen Sekolah Terintegrasi
              </p>
              <p className="text-xs text-gray-500">
                © 2025 Yayasan Pendidikan Islam An-Nur Cikarang Baru
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default UserLanding;
