// Types untuk Role dan Permission Management

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'import';

export interface ModulePermission {
  moduleName: string;
  permissions: {
    [key in PermissionAction]?: boolean;
  };
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isSystemRole: boolean; // Role yang tidak bisa dihapus/diubah (seperti Super Admin)
  modulePermissions: ModulePermission[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  userCount?: number; // Jumlah user yang menggunakan role ini
}

export interface RoleFormData {
  name: string;
  description?: string;
  isActive: boolean;
  modulePermissions: ModulePermission[];
}

export interface RoleFilters {
  name: string;
  isActive: string;
  isSystemRole: string;
}

// Definisi modul aplikasi
export interface AppModule {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon?: string;
  category: 'core' | 'academic' | 'financial' | 'administrative';
  defaultPermissions: PermissionAction[];
}

// Modul aplikasi yang tersedia
export const APP_MODULES: AppModule[] = [
  {
    id: 'tata-usaha',
    name: 'tata-usaha',
    displayName: 'Tata Usaha',
    description: 'Modul administrasi dan manajemen cashflow',
    category: 'administrative',
    defaultPermissions: ['view', 'create', 'edit', 'delete', 'export']
  },
  {
    id: 'pemasukan',
    name: 'pemasukan',
    displayName: 'Pemasukan',
    description: 'Modul manajemen pemasukan dan transaksi masuk',
    category: 'administrative',
    defaultPermissions: ['view', 'create', 'edit', 'delete', 'export']
  },
  {
    id: 'pengeluaran',
    name: 'pengeluaran',
    displayName: 'Pengeluaran', 
    description: 'Modul manajemen pengeluaran dan transaksi keluar',
    category: 'administrative',
    defaultPermissions: ['view', 'create', 'edit', 'delete', 'export']
  },
  {
    id: 'payroll',
    name: 'payroll',
    displayName: 'Payroll',
    description: 'Modul penggajian dan manajemen karyawan',
    category: 'financial',
    defaultPermissions: ['view', 'create', 'edit', 'delete', 'export']
  },
  {
    id: 'sarpras',
    name: 'sarpras',
    displayName: 'Sarpras',
    description: 'Modul sarana dan prasarana',
    category: 'administrative',
    defaultPermissions: ['view', 'create', 'edit', 'delete', 'export']
  },
  {
    id: 'dana-usaha',
    name: 'dana-usaha',
    displayName: 'Dana Usaha',
    description: 'Modul manajemen unit bisnis',
    category: 'financial',
    defaultPermissions: ['view', 'create', 'edit', 'delete', 'export']
  },
  {
    id: 'parent',
    name: 'parent',
    displayName: 'CMS Parent',
    description: 'Modul content management untuk portal orang tua',
    category: 'academic',
    defaultPermissions: ['view', 'create', 'edit', 'delete']
  },
  {
    id: 'guru',
    name: 'guru',
    displayName: 'Guru',
    description: 'Modul dashboard guru',
    category: 'academic',
    defaultPermissions: ['view', 'create', 'edit', 'export']
  },
  {
    id: 'student',
    name: 'student',
    displayName: 'Student',
    description: 'Modul manajemen siswa',
    category: 'academic',
    defaultPermissions: ['view', 'create', 'edit', 'delete', 'export']
  },
  {
    id: 'divisi-unit',
    name: 'divisi-unit',
    displayName: 'Divisi/Unit',
    description: 'Modul manajemen divisi dan unit',
    category: 'administrative',
    defaultPermissions: ['view', 'create', 'edit', 'delete']
  },
  {
    id: 'akuntansi',
    name: 'akuntansi',
    displayName: 'Akuntansi',
    description: 'Modul sistem akuntansi',
    category: 'financial',
    defaultPermissions: ['view', 'create', 'edit', 'delete', 'export']
  },
  {
    id: 'tagihan-siswa',
    name: 'tagihan-siswa',
    displayName: 'Tagihan Siswa',
    description: 'Modul tagihan dan pembayaran siswa',
    category: 'financial',
    defaultPermissions: ['view', 'create', 'edit', 'delete', 'export']
  },
  {
    id: 'master-data',
    name: 'master-data',
    displayName: 'Master Data',
    description: 'Modul master data aplikasi',
    category: 'core',
    defaultPermissions: ['view', 'create', 'edit', 'delete', 'import', 'export']
  },
  {
    id: 'user',
    name: 'user',
    displayName: 'User Management',
    description: 'Modul manajemen pengguna',
    category: 'core',
    defaultPermissions: ['view', 'create', 'edit', 'delete', 'import', 'export']
  },
  {
    id: 'rapbs',
    name: 'rapbs',
    displayName: 'RAPBS',
    description: 'Modul perencanaan anggaran',
    category: 'financial',
    defaultPermissions: ['view', 'create', 'edit', 'delete', 'export']
  }
];

// Permission labels untuk display
export const PERMISSION_LABELS: Record<PermissionAction, string> = {
  view: 'Lihat',
  create: 'Tambah',
  edit: 'Edit',
  delete: 'Hapus',
  export: 'Export',
  import: 'Import'
};

// Helper functions
export const createDefaultModulePermissions = (): ModulePermission[] => {
  return APP_MODULES.map(module => ({
    moduleName: module.name,
    permissions: module.defaultPermissions.reduce((acc, permission) => {
      acc[permission] = false;
      return acc;
    }, {} as Record<PermissionAction, boolean>)
  }));
};

export const hasPermission = (
  modulePermissions: ModulePermission[],
  moduleName: string,
  action: PermissionAction
): boolean => {
  const modulePermission = modulePermissions.find(mp => mp.moduleName === moduleName);
  return modulePermission?.permissions[action] || false;
};

export const getModuleDisplayName = (moduleName: string): string => {
  const module = APP_MODULES.find(m => m.name === moduleName);
  return module?.displayName || moduleName;
};

export const getModulesByCategory = () => {
  return APP_MODULES.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, AppModule[]>);
};

export const CATEGORY_LABELS: Record<string, string> = {
  core: 'Sistem Inti',
  academic: 'Akademik',
  financial: 'Keuangan',
  administrative: 'Administrasi'
};
