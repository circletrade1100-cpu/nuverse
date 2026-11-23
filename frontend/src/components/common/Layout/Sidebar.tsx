import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  CalculatorIcon,
  UsersIcon,
  ChevronRightIcon,
  CubeIcon,
  MegaphoneIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { usePermission } from '../../../hooks/usePermission';

interface SubMenuItem {
  name: string;
  path: string;
  module: string;
  submenu?: SubMenuItem[];
}

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  module: string;
  submenu?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { 
    name: 'Dashboard', 
    path: '/dashboard', 
    icon: HomeIcon,
    description: 'Overview & Statistics',
    color: 'text-blue-500',
    module: 'dashboard' // Dashboard always accessible
  },
  { 
    name: 'Tata Usaha', 
    path: '/tata-usaha', 
    icon: DocumentTextIcon,
    description: 'Administrative Tasks',
    color: 'text-emerald-500',
    module: 'tata-usaha',
    submenu: [
      { name: 'Dashboard TU', path: '/tata-usaha/dashboard', module: 'tata-usaha' },
      { name: 'Absensi Karyawan', path: '/tata-usaha/absensi', module: 'tata-usaha' },
      { 
        name: 'Manajemen Cashflow', 
        path: '/tata-usaha/cashflow',
        module: 'tata-usaha',
        submenu: [
          { name: 'Pemasukan', path: '/tata-usaha/pemasukan', module: 'pemasukan' },
          { name: 'Pengeluaran', path: '/tata-usaha/pengeluaran', module: 'pengeluaran' },
          { name: 'Tagihan Siswa', path: '/tagihan-siswa', module: 'tagihan-siswa' },
          { name: 'Report TU', path: '/tata-usaha/report', module: 'tata-usaha' }
        ]
      }
    ]
  },
  { 
    name: 'Payroll', 
    path: '/payroll',
    icon: CurrencyDollarIcon,
    description: 'Salary Management',
    color: 'text-amber-500',
    module: 'payroll',
    submenu: [
      { name: 'Absensi Karyawan', path: '/payroll/absensi-karyawan', module: 'payroll' },
      { 
        name: 'Cuti Karyawan', 
        path: '/payroll/cuti-karyawan',
        module: 'payroll',
        submenu: [
          { name: 'Daftar Pengajuan Cuti', path: '/payroll/cuti-karyawan/pengajuan', module: 'payroll' }
        ]
      },
      { 
        name: 'Payroll', 
        path: '/payroll/gaji',
        module: 'payroll',
        submenu: [
          { name: 'Slip Gaji', path: '/payroll/gaji/slip-gaji', module: 'payroll' },
          // { name: 'Rekap Slip Gaji', path: '/payroll/gaji/rekap-slip', module: 'payroll' },
          { name: 'Report Slip Gaji', path: '/payroll/gaji/report-slip', module: 'payroll' }
        ]
      },
      { name: 'THR', path: '/payroll/thr', module: 'payroll' },
      { name: 'Koperasi', path: '/payroll/koperasi', module: 'payroll' },
      { 
        name: 'Rekapitulasi', 
        path: '/payroll/rekapitulasi',
        module: 'payroll',
        submenu: [
          { name: 'Laporan Gaji Bulanan', path: '/payroll/rekapitulasi/laporan-gaji', module: 'payroll' },
          { name: 'Laporan Lembur & Absensi', path: '/payroll/rekapitulasi/laporan-lembur', module: 'payroll' },
          { name: 'Laporan Pajak & BPJS', path: '/payroll/rekapitulasi/laporan-pajak', module: 'payroll' }
        ]
      }
    ]
  },
  { 
    name: 'SARPRAS', 
    path: '/sarpras/inventory', 
    icon: BuildingOfficeIcon,
    description: 'Facilities & Infrastructure',
    color: 'text-purple-500',
    module: 'sarpras',
    submenu: [
      { name: 'Inventaris Aset', path: '/sarpras/inventory', module: 'sarpras' },
      { name: 'Jadwal Maintenance', path: '/sarpras/maintenance', module: 'sarpras' },
      { name: 'Pengajuan Perbaikan', path: '/sarpras/repair-request', module: 'sarpras' },
      { 
        name: 'Penyusutan & Audit', 
        path: '/sarpras/depreciation',
        module: 'sarpras',
        submenu: [
          { name: 'Penyusutan Barang', path: '/sarpras/depreciation', module: 'sarpras' },
          { name: 'Audit Barang', path: '/sarpras/audit', module: 'sarpras' },
        ]
      },
    ]
  },
  { 
    name: 'Dana Usaha', 
    path: '/dana-usaha', 
    icon: BanknotesIcon,
    description: 'Business Units',
    color: 'text-green-500',
    module: 'dana-usaha'
  },
  { 
    name: 'Student', 
    path: '/student', 
    icon: UserGroupIcon,
    description: 'Student Management',
    color: 'text-emerald-500',
    module: 'student'
  },
  { 
    name: 'Guru', 
    path: '/guru', 
    icon: AcademicCapIcon,
    description: 'Teacher Dashboard',
    color: 'text-indigo-500',
    module: 'guru'
  },
  { 
    name: 'Divisi/Unit', 
    path: '/divisi-unit', 
    icon: BuildingStorefrontIcon,
    description: 'Department Management',
    color: 'text-cyan-500',
    module: 'divisi-unit',
    submenu: [
      { name: 'Pemasukan Sekolah Reguler', path: '/divisi-unit/pemasukan-reguler', module: 'divisi-unit' },
      { name: 'Pemasukan Sekolah Unit', path: '/divisi-unit/pemasukan-unit', module: 'divisi-unit' },
      { name: 'Pemasukan Sumber Lainnya', path: '/divisi-unit/pemasukan-lainnya', module: 'divisi-unit' },
      { name: 'Pengeluaran Sekolah Reguler', path: '/divisi-unit/pengeluaran-reguler', module: 'divisi-unit' },
      { name: 'Pengeluaran Sekolah BOS', path: '/divisi-unit/pengeluaran-bos', module: 'divisi-unit' },
      { name: 'Pengeluaran Sumber Lainnya', path: '/divisi-unit/pengeluaran-lainnya', module: 'divisi-unit' },
      { name: 'Presensi Guru', path: '/divisi-unit/presensi-guru', module: 'divisi-unit' },
      { name: 'Upload Pengeluaran', path: '/divisi-unit/upload-pengeluaran', module: 'divisi-unit' },
      { name: 'Input Payroll TU', path: '/divisi-unit/input-payroll-tu', module: 'divisi-unit' }
    ]
  },
  { 
    name: 'RAPBS', 
    path: '/rapbs', 
    icon: ChartBarIcon,
    description: 'Budget Planning',
    color: 'text-orange-500',
    module: 'rapbs',
    submenu: [
      { name: 'Dashboard', path: '/rapbs/dashboard', module: 'rapbs' },
      { name: 'Rencana RAPBS', path: '/rapbs/rencana', module: 'rapbs' },
      { name: 'Realisasi', path: '/rapbs/realisasi', module: 'rapbs' },
      { name: 'Laporan', path: '/rapbs/laporan', module: 'rapbs' },
      { 
        name: 'Master Data', 
        path: '/rapbs/master-data',
        module: 'rapbs',
        submenu: [
          { name: 'Tahun Ajaran', path: '/rapbs/master-data/tahun-ajaran', module: 'rapbs' },
          { name: 'Kategori Kegiatan', path: '/rapbs/master-data/kategori-kegiatan', module: 'rapbs' },
          { name: 'Sumber Dana', path: '/rapbs/master-data/sumber-dana', module: 'rapbs' }
        ]
      }
    ]
  },
  { 
    name: 'LPJ', 
    path: '/lpj', 
    icon: ClipboardDocumentCheckIcon,
    description: 'Laporan Pertanggung Jawaban',
    color: 'text-teal-500',
    module: 'lpj'
  },
  { 
    name: 'Akuntansi', 
    path: '/akuntansi', 
    icon: CalculatorIcon,
    description: 'Accounting System',
    color: 'text-red-500',
    module: 'akuntansi',
    submenu: [
      { name: 'Dashboard Akuntansi', path: '/akuntansi/dashboard', module: 'akuntansi' },
      { name: 'Chart of Accounts', path: '/akuntansi/chart-of-accounts', module: 'akuntansi' },
      { name: 'Jurnal Umum', path: '/akuntansi/journal-entries', module: 'akuntansi' },
      { name: 'General Ledger', path: '/akuntansi/general-ledger', module: 'akuntansi' },
      { 
        name: 'Laporan Keuangan', 
        path: '/akuntansi/reports',
        module: 'akuntansi',
        submenu: [
          { name: 'Neraca', path: '/akuntansi/reports/balance-sheet', module: 'akuntansi' },
          { name: 'Laba Rugi', path: '/akuntansi/reports/income-statement', module: 'akuntansi' },
          { name: 'Arus Kas', path: '/akuntansi/reports/cash-flow', module: 'akuntansi' }
        ]
      }
    ]
  },
  { 
    name: 'CMS Parent', 
    path: '/cms-parent', 
    icon: MegaphoneIcon,
    description: 'Content Management for Parent Portal',
    color: 'text-pink-500',
    module: 'parent',
    submenu: [
      { name: 'Kalender Akademik', path: '/cms-parent/calendar', module: 'parent' },
      { name: 'Pengumuman', path: '/cms-parent/announcements', module: 'parent' },
      { name: 'Banner', path: '/cms-parent/banners', module: 'parent' }
    ]
  },
  { 
    name: 'Master Data', 
    path: '/master-data', 
    icon: CubeIcon,
    description: 'Master Data Management',
    color: 'text-violet-500',
    module: 'master-data',
    submenu: [
      { name: 'Unit Kerja', path: '/master-data/unit-kerja', module: 'master-data' },
      { name: 'Unit Sekolah', path: '/master-data/unit-sekolah', module: 'master-data' },
      { name: 'Unit Kelas', path: '/master-data/unit-kelas', module: 'master-data' },
      { name: 'Jabatan', path: '/master-data/jabatan', module: 'master-data' },
      { name: 'Bank', path: '/master-data/bank', module: 'master-data' },
      { name: 'Role', path: '/master-data/role', module: 'master-data' },
      { name: 'Kategori Pemasukan', path: '/master-data/kategori-pemasukan', module: 'kategori_pemasukan' },
      { name: 'Kategori Pengeluaran', path: '/master-data/kategori-pengeluaran', module: 'kategori_pengeluaran' },
      { name: 'Jenis Tagihan', path: '/master-data/jenis-tagihan', module: 'jenis_tagihan' },
      { name: 'Jenis Unit Usaha', path: '/master-data/jenis-unit-usaha', module: 'master-data' }
    ]
  },
  { 
    name: 'User', 
    path: '/user', 
    icon: UsersIcon,
    description: 'User Management',
    color: 'text-slate-500',
    module: 'user'
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const { hasModuleAccess, isSuperAdmin } = usePermission();

  // Stable filter function using useCallback
  const filterMenuItem = useCallback((item: MenuItem | SubMenuItem, parentName?: string): MenuItem | SubMenuItem | null => {
    // Dashboard is always accessible
    if (item.module === 'dashboard') {
      return item;
    }

    // Hide Master Data submenu in RAPBS for non-super admin users
    if (item.name === 'Master Data' && parentName === 'RAPBS') {
      if (!isSuperAdmin()) {
        return null;
      }
    }

    // Super admin has access to everything
    if (isSuperAdmin()) {
      // If item has submenu, filter the submenu items too
      if (item.submenu) {
        const filteredSubmenu = item.submenu
          .map((subItem: SubMenuItem) => filterMenuItem(subItem, item.name))
          .filter((subItem: MenuItem | SubMenuItem | null): subItem is MenuItem | SubMenuItem => subItem !== null);

        // If no submenu items are accessible, hide the parent
        if (filteredSubmenu.length === 0) {
          return null;
        }

        return {
          ...item,
          submenu: filteredSubmenu
        };
      }
      return item;
    }

    // Check if user has access to this module
    if (!hasModuleAccess(item.module)) {
      return null;
    }

    // If item has submenu, filter the submenu items too
    if (item.submenu) {
      const filteredSubmenu = item.submenu
        .map((subItem: SubMenuItem) => filterMenuItem(subItem, item.name))
        .filter((subItem: MenuItem | SubMenuItem | null): subItem is MenuItem | SubMenuItem => subItem !== null);

      // If no submenu items are accessible, hide the parent
      if (filteredSubmenu.length === 0) {
        return null;
      }

      return {
        ...item,
        submenu: filteredSubmenu
      };
    }

    return item;
  }, [hasModuleAccess, isSuperAdmin]);

  // Filter menu items based on user permissions
  const filteredMenuItems = useMemo(() => {
    return menuItems
      .map(item => filterMenuItem(item, undefined))
      .filter((item): item is MenuItem => item !== null) as MenuItem[];
  }, [filterMenuItem]);

  // Auto-open menus based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const menusToOpen: string[] = [];

    // Check each menu item for auto-open - use original menuItems to avoid dependency issues
    const itemsToCheck = filteredMenuItems.length > 0 ? filteredMenuItems : menuItems;
    
    itemsToCheck.forEach(item => {
      if (item.submenu) {
        // Check if current path matches main menu or any submenu item
        const isMainPathActive = currentPath.startsWith(item.path) && currentPath !== item.path;
        
        const hasActiveSubmenu = item.submenu.some((subItem: SubMenuItem) => {
          if (currentPath === subItem.path || currentPath.startsWith(subItem.path + '/')) {
            return true;
          }
          // Check nested submenu
          if (subItem.submenu) {
            return subItem.submenu.some((nestedItem: SubMenuItem) => 
              currentPath === nestedItem.path || currentPath.startsWith(nestedItem.path + '/')
            );
          }
          return false;
        });

        if (isMainPathActive || hasActiveSubmenu) {
          menusToOpen.push(item.name);
          
          // Also open nested submenus if needed
          item.submenu.forEach((subItem: SubMenuItem) => {
            if (subItem.submenu) {
              const hasActiveNestedSubmenu = subItem.submenu.some((nestedItem: SubMenuItem) => 
                currentPath === nestedItem.path || currentPath.startsWith(nestedItem.path + '/')
              );
              if (hasActiveNestedSubmenu || currentPath.startsWith(subItem.path + '/')) {
                menusToOpen.push(`${item.name}-${subItem.name}`);
              }
            }
          });
        }
      }
    });

    setOpenMenus(menusToOpen);
  }, [location.pathname]); // Remove filteredMenuItems from dependency

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };
  
  return (
    <div className="drawer-side z-50">
      <label htmlFor="my-drawer-2" className="drawer-overlay pointer-events-none"></label>
      <aside className="bg-gradient-to-b from-slate-50 to-white w-72 lg:w-80 min-h-screen shadow-xl border-r border-slate-200 flex flex-col relative z-50">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-slate-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200">
              <img 
                src="/logo-annur.png" 
                alt="Logo Annur" 
                className="w-6 h-6 lg:w-8 lg:h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-slate-800">SalamAnnur.id</h1>
              <p className="text-xs text-slate-500 font-medium">Manajemen Sistem</p>
            </div>
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="p-4 flex-1 overflow-y-auto pb-20">
          <div className="space-y-3">
            {filteredMenuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const IconComponent = item.icon;
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isMenuOpen = openMenus.includes(item.name);
              
              
              return (
                <div key={item.name} className="relative z-10">
                  {/* Main Menu Item */}
                  {hasSubmenu ? (
                    <button 
                      onClick={() => toggleMenu(item.name)}
                      onMouseEnter={(e) => {
                        // Prevent accidental hover on adjacent items
                        e.currentTarget.style.zIndex = '20';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.zIndex = '10';
                      }}
                      className={`group relative flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl transition-all duration-200 w-full text-left ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                          : 'hover:bg-white hover:shadow-md text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center transition-colors ${
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-slate-100 group-hover:bg-slate-200'
                      }`}>
                        <IconComponent className={`w-4 h-4 lg:w-5 lg:h-5 ${
                          isActive ? 'text-white' : item.color
                        }`} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${
                          isActive ? 'text-white' : 'text-slate-800'
                        }`}>
                          {item.name}
                        </p>
                        <p className={`text-xs mt-0.5 ${
                          isActive ? 'text-blue-100' : 'text-slate-500'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                      
                      {/* Chevron for submenu */}
                      <div className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : ''}`}>
                        <ChevronRightIcon className={`w-4 h-4 ${
                          isActive ? 'text-white' : 'text-slate-400'
                        }`} />
                      </div>
                    </button>
                  ) : (
                    <Link 
                      to={item.path}
                      className={`group relative flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                          : 'hover:bg-white hover:shadow-md text-slate-700 hover:text-slate-900'
                      }`}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.zIndex = '20';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.zIndex = '10';
                      }}
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center transition-colors ${
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-slate-100 group-hover:bg-slate-200'
                      }`}>
                        <IconComponent className={`w-4 h-4 lg:w-5 lg:h-5 ${
                          isActive ? 'text-white' : item.color
                        }`} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${
                          isActive ? 'text-white' : 'text-slate-800'
                        }`}>
                          {item.name}
                        </p>
                        <p className={`text-xs mt-0.5 ${
                          isActive ? 'text-blue-100' : 'text-slate-500'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                      
                      {/* Hover indicator */}
                      {!isActive && (
                        <div className="w-2 h-2 rounded-full bg-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  )}

                  {/* Submenu */}
                  {hasSubmenu && (
                    <div className={`ml-4 lg:ml-6 mt-2 space-y-1 transition-all duration-200 ${
                      isMenuOpen ? 'max-h-screen opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none overflow-hidden'
                    }`}>
                      {item.submenu!.map((subItem) => {
                        const isSubActive = location.pathname === subItem.path || 
                          (subItem.submenu && subItem.submenu.some(nested => location.pathname === nested.path));
                        const hasNestedSubmenu = subItem.submenu && subItem.submenu.length > 0;
                        const isSubMenuOpen = openMenus.includes(`${item.name}-${subItem.name}`);
                        
                        return (
                          <div key={subItem.name} className="relative">
                            {hasNestedSubmenu ? (
                              <button
                                onClick={() => toggleMenu(`${item.name}-${subItem.name}`)}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-sm w-full text-left ${
                                  isSubActive
                                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-500'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                }`}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.zIndex = '15';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.zIndex = 'auto';
                                }}
                              >
                                <div className={`w-2 h-2 rounded-full ${
                                  isSubActive ? 'bg-blue-500' : 'bg-slate-300'
                                }`}></div>
                                <span className="flex-1">{subItem.name}</span>
                                <div className={`transition-transform duration-200 ${isSubMenuOpen ? 'rotate-90' : ''}`}>
                                  <ChevronRightIcon className="w-3 h-3 text-slate-400" />
                                </div>
                              </button>
                            ) : (
                              <Link
                                to={subItem.path}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-sm ${
                                  isSubActive
                                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-500'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                }`}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.zIndex = '15';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.zIndex = 'auto';
                                }}
                              >
                                <div className={`w-2 h-2 rounded-full ${
                                  isSubActive ? 'bg-blue-500' : 'bg-slate-300'
                                }`}></div>
                                {subItem.name}
                              </Link>
                            )}

                            {/* Nested Submenu */}
                            {hasNestedSubmenu && (
                              <div className={`ml-4 lg:ml-6 mt-1 space-y-1 transition-all duration-200 ${
                                isSubMenuOpen ? 'max-h-screen opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none overflow-hidden'
                              }`}>
                                {subItem.submenu!.map((nestedItem) => {
                                  const isNestedActive = location.pathname === nestedItem.path;
                                  return (
                                    <Link
                                      key={nestedItem.name}
                                      to={nestedItem.path}
                                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors text-xs ${
                                        isNestedActive
                                          ? 'bg-green-50 text-green-700 font-semibold border-l-2 border-green-500'
                                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                      }`}
                                    >
                                      <div className={`w-1.5 h-1.5 rounded-full ${
                                        isNestedActive ? 'bg-green-500' : 'bg-slate-400'
                                      }`}></div>
                                      {nestedItem.name}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
          <div className="text-center">
            <p className="text-xs text-slate-400">© 2024 Sekolah Annur</p>
            <p className="text-xs text-slate-400">Version 1.0.0</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;