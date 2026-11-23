/**
 * Utility functions for permission management
 */

export const MODULE_MAPPING = {
  'dashboard': 'dashboard',
  'tata-usaha': 'tata-usaha',
  'pemasukan': 'pemasukan',
  'pengeluaran': 'pengeluaran',
  'payroll': 'payroll',
  'sarpras': 'sarpras',
  'dana-usaha': 'dana-usaha',
  'student': 'student',
  'guru': 'guru',
  'divisi-unit': 'divisi-unit',
  'rapbs': 'rapbs',
  'akuntansi': 'akuntansi',
  'master-data': 'master-data',
  'user': 'user',
  'parent': 'parent'
} as const;

export type ModuleName = keyof typeof MODULE_MAPPING;

/**
 * Get module name from path
 */
export const getModuleFromPath = (path: string): string => {
  // Remove leading slash
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Extract first segment
  const segments = cleanPath.split('/');
  const firstSegment = segments[0];
  
  // Handle special cases
  if (firstSegment === 'tata-usaha') {
    const secondSegment = segments[1];
    if (secondSegment === 'pemasukan') return 'pemasukan';
    if (secondSegment === 'pengeluaran') return 'pengeluaran';
    return 'tata-usaha';
  }
  
  if (firstSegment === 'master-data') {
    return 'master-data';
  }
  
  return firstSegment || 'dashboard';
};

/**
 * Check if path requires permission check
 */
export const isProtectedPath = (path: string): boolean => {
  const publicPaths = ['/login', '/register', '/', '/guru/login', '/parent/login'];
  const guruPaths = ['/guru'];
  const parentPaths = ['/parent'];
  
  // Public paths don't need permission check
  if (publicPaths.includes(path)) {
    return false;
  }
  
  // Guru and parent dashboard have their own auth system
  if (guruPaths.some(p => path.startsWith(p)) || parentPaths.some(p => path.startsWith(p))) {
    return false;
  }
  
  return true;
};
