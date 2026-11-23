# Guru Payroll Service Documentation

## Overview
`guruPayrollService.tsx` adalah service yang digunakan untuk mengambil data payroll guru dari backend Laravel berdasarkan guruId. Service ini menyediakan fungsi-fungsi untuk mengambil data payroll terbaru dan riwayat gaji dari bulan-bulan sebelumnya.

## Features
- ✅ Mengambil data payroll terbaru berdasarkan guruId
- ✅ Mengambil riwayat gaji dari bulan-bulan sebelumnya
- ✅ Format data untuk komponen UI
- ✅ Error handling dan logging
- ✅ TypeScript support dengan interface yang lengkap

## API Endpoints
Service ini menggunakan endpoint berikut dari PayrollController.php:

1. **Data Payroll Terbaru**: `GET /master-data/payroll/guru/{guruId}`
2. **Riwayat Payroll**: `GET /master-data/payroll/guru/{guruId}/history`

## Usage Examples

### 1. Mengambil Data Payroll Terbaru
```typescript
import { guruPayrollService } from '../services/guruPayrollService';

const guruId = 1;

try {
  const payrollData = await guruPayrollService.getGuruPayroll(guruId);
  console.log('Payroll Data:', payrollData);
} catch (error) {
  console.error('Error:', error);
}
```

### 2. Mengambil Riwayat Gaji
```typescript
import { guruPayrollService } from '../services/guruPayrollService';

const guruId = 1;

try {
  const historyData = await guruPayrollService.getGuruPayrollHistory(guruId);
  console.log('History Data:', historyData);
} catch (error) {
  console.error('Error:', error);
}
```

### 3. Mengambil Data Lengkap (Payroll + History)
```typescript
import { guruPayrollService } from '../services/guruPayrollService';

const guruId = 1;

try {
  const { payrollData, historyData } = await guruPayrollService.getGuruPayrollWithHistory(guruId);
  console.log('Payroll:', payrollData);
  console.log('History:', historyData);
} catch (error) {
  console.error('Error:', error);
}
```

### 4. Format Data untuk UI
```typescript
import { guruPayrollService } from '../services/guruPayrollService';

// Ambil data mentah dari API
const rawPayrollData = await guruPayrollService.getGuruPayroll(guruId);

// Format untuk komponen UI
const formattedData = guruPayrollService.formatPayrollForUI(rawPayrollData);

// Sekarang data siap digunakan di komponen
console.log(formattedData.gajiPokok); // 4500000
console.log(formattedData.netSalary); // 8040000
console.log(formattedData.tunjangan.jabatan); // 500000
```

### 5. Penggunaan dalam React Component
```typescript
import React, { useState, useEffect } from 'react';
import { guruPayrollService } from '../services/guruPayrollService';

const PayrollComponent: React.FC = () => {
  const [payrollData, setPayrollData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { payrollData, historyData } = await guruPayrollService.getGuruPayrollWithHistory(1);
        
        setPayrollData(payrollData ? guruPayrollService.formatPayrollForUI(payrollData) : null);
        setHistoryData(guruPayrollService.formatHistoryForUI(historyData));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!payrollData) return <div>No data found</div>;

  return (
    <div>
      <h1>Gaji: {payrollData.netSalary}</h1>
      <h2>Riwayat Gaji:</h2>
      {historyData.map(item => (
        <div key={item.id}>
          {item.bulan}: {item.gaji}
        </div>
      ))}
    </div>
  );
};
```

## Data Structure

### PayrollData Interface
```typescript
interface PayrollData {
  guru: PayrollGuru;
  periode: PayrollPeriode;
  gaji_pokok: number;
  tunjangan: PayrollTunjangan;
  potongan: PayrollPotongan[];
  total_potongan: number;
  gaji_bersih: number;
  created_date: string;
  created_by: string;
}
```

### PayrollHistoryItem Interface
```typescript
interface PayrollHistoryItem {
  id: number;
  periode: string;
  periode_bulan: string;
  periode_tahun: string;
  gaji_pokok: number;
  total_gaji: number;
  total_potongan: number;
  gaji_bersih: number;
  status: string;
  created_date: string;
}
```

## Error Handling
Service ini menyediakan error handling yang komprehensif:

```typescript
try {
  const data = await guruPayrollService.getGuruPayroll(guruId);
} catch (error) {
  // Error akan berisi pesan dari backend atau error message default
  console.error('Error fetching payroll:', error.message);
}
```

## Authentication
Service ini menggunakan `phpApiMethods` yang sudah mengatur authentication token secara otomatis. Pastikan token tersimpan di localStorage dengan key `auth_token`.

## Notes
- Service ini menggunakan `phpApiMethods` untuk komunikasi dengan backend Laravel
- Data diurutkan berdasarkan periode terbaru (descending)
- Jika tidak ada data payroll, service akan return null untuk payrollData
- Jika tidak ada riwayat, service akan return empty array untuk historyData
- Semua console.log menggunakan emoji untuk memudahkan debugging

## File Structure
```
src/
├── services/
│   └── guruPayrollService.tsx
├── examples/
│   └── PayrollWithService.tsx
└── pages/
    └── Dashboard-Guru/
        └── Payroll.tsx
```
