import React from 'react';
import Payroll from '../pages/Dashboard-Guru/Payroll';

/**
 * Contoh penggunaan komponen Payroll yang sudah terintegrasi dengan backend
 * 
 * Komponen ini akan:
 * 1. Mengambil data guru dari useGuruAuth hook
 * 2. Menggunakan guruId untuk mengambil data payroll dari backend
 * 3. Menampilkan data payroll real-time dari database
 * 4. Menampilkan pesan bahwa fitur riwayat sedang dikembangkan
 * 
 * Pastikan:
 * - Guru sudah login (useGuruAuth mengembalikan data guru)
 * - Backend API endpoint tersedia di /master-data/payroll/guru/{guruId}
 * - Token authentication tersimpan di localStorage
 */
const PayrollIntegrationExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Payroll />
    </div>
  );
};

export default PayrollIntegrationExample;
