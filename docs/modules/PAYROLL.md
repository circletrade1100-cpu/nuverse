# Modul PAYROLL

## 👥 Data Karyawan

### Fitur Utama
- **Biodata Lengkap**: Data pribadi, kontak, keluarga
- **Riwayat Kerja**: Pengalaman, pendidikan, sertifikasi
- **Dokumen**: Upload KTP, ijazah, sertifikat
- **Status Kepegawaian**: Tetap, kontrak, honorer

### Database Schema
```sql
CREATE TABLE employees (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_number VARCHAR(20) UNIQUE,
    name VARCHAR(100),
    position VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(15,2),
    tax_status ENUM('single', 'married', 'married_with_children'),
    bank_account VARCHAR(50),
    bank_name VARCHAR(100),
    status ENUM('active', 'inactive', 'terminated'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 📅 Absensi Karyawan

### Fitur
- **Real-time Attendance**: QR Code / GPS tracking
- **Overtime Tracking**: Lembur otomatis
- **Leave Management**: Cuti, sakit, ijin
- **Attendance Reports**: Rekap harian/mingguan/bulanan

### API Endpoints
```php
// Attendance Management
GET /api/payroll/attendance
POST /api/payroll/attendance/check-in
POST /api/payroll/attendance/check-out
GET /api/payroll/attendance/report
POST /api/payroll/attendance/overtime
```

## 🏖️ Pengajuan Cuti

### Jenis Cuti
- **Cuti Tahunan**: 12 hari per tahun
- **Cuti Sakit**: Dengan surat dokter
- **Cuti Melahirkan**: 3 bulan
- **Cuti Ijin**: Keperluan pribadi
- **Cuti Besar**: Setelah 6 tahun kerja

### Workflow Approval
1. **Karyawan**: Submit pengajuan
2. **Atasan Langsung**: Approval level 1
3. **HR**: Approval level 2
4. **Kepala Sekolah**: Final approval

### Database Schema
```sql
CREATE TABLE leave_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT,
    leave_type ENUM('annual', 'sick', 'maternity', 'personal', 'long'),
    start_date DATE,
    end_date DATE,
    total_days INT,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected'),
    approved_by BIGINT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 📊 Report Cuti

### Laporan yang Tersedia
1. **Rekap Cuti per Karyawan**
2. **Rekap Cuti per Departemen**
3. **Sisa Cuti Tahunan**
4. **Trend Pengajuan Cuti**
5. **Analisis Pola Cuti**

## 💰 Slip Gaji

### Komponen Gaji
- **Gaji Pokok**: Gaji dasar
- **Tunjangan**: Jabatan, transport, makan
- **Bonus**: Performance, tahunan
- **Potongan**: Pajak, BPJS, pinjaman
- **Lembur**: Jam kerja ekstra

### Template Slip Gaji
```php
// Slip Gaji Structure
{
    "employee_info": {
        "name": "Nama Karyawan",
        "position": "Jabatan",
        "employee_number": "NIP"
    },
    "salary_period": "Januari 2024",
    "earnings": {
        "basic_salary": 5000000,
        "position_allowance": 1000000,
        "transport_allowance": 500000,
        "meal_allowance": 300000,
        "overtime": 200000
    },
    "deductions": {
        "tax": 500000,
        "bpjs": 200000,
        "loan": 0
    },
    "net_salary": 6100000
}
```

## 📈 Rekap Slip Gaji

### Fitur
- **Bulk Generation**: Generate slip massal
- **Digital Signature**: Tanda tangan digital
- **PDF Export**: Export ke PDF
- **Email Delivery**: Kirim via email
- **Archive**: Penyimpanan digital

## 📋 Rekapitulasi

### Laporan per Divisi/Karyawan
- **Gaji per Departemen**
- **Rata-rata Gaji per Level**
- **Perbandingan Gaji antar Divisi**
- **Trend Kenaikan Gaji**

### Lembur, Cuti, Kehadiran
- **Jam Lembur per Karyawan**
- **Rata-rata Kehadiran**
- **Analisis Pola Cuti**
- **Efisiensi Kerja**

### Pajak, BPJS, Audit Trail
- **Perhitungan Pajak Otomatis**
- **BPJS Contribution Tracking**
- **Audit Trail Gaji**
- **Compliance Reporting**

## 🔐 Security & Permissions

### Role HR
- View all employee data
- Manage payroll
- Generate salary slips
- View reports

### Role Manager
- View team data
- Approve leave requests
- View team reports

### Role Employee
- View own data
- Submit leave requests
- View own salary slip

## 📱 Frontend Components

### Payroll Components
```jsx
// Employee Management
<EmployeeList />
<EmployeeForm />
<EmployeeDetail />

// Attendance Components
<AttendanceTracker />
<AttendanceReport />
<OvertimeForm />

// Leave Management
<LeaveRequestForm />
<LeaveApproval />
<LeaveReport />

// Salary Components
<SalarySlip />
<SalaryReport />
<PayrollSummary />
```

## 🎯 Key Performance Indicators (KPI)

### HR KPIs
- Employee satisfaction rate
- Turnover rate
- Average salary
- Leave utilization rate

### Financial KPIs
- Total payroll cost
- Average salary per department
- Overtime cost
- Benefits cost ratio

## 📊 Reporting & Analytics

### Standard Reports
1. **Monthly Payroll Report**
2. **Leave Balance Report**
3. **Overtime Analysis**
4. **Tax Summary Report**
5. **Benefits Cost Report**

### Advanced Analytics
- Salary trend analysis
- Department cost comparison
- Leave pattern analysis
- Overtime efficiency
- Benefits utilization
