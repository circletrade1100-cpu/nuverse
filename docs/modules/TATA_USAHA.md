# Modul TATA USAHA (TU)

## 📊 Dashboard TU Analytics

### Fitur Utama
- **Total Pemasukan**: Real-time tracking pemasukan hari ini/bulan ini
- **Jumlah Pengeluaran**: Monitoring pengeluaran operasional
- **Reminder Tagihan SPP**: Notifikasi otomatis untuk SPP jatuh tempo
- **Notifikasi Persetujuan**: Approval workflow untuk transaksi
- **Status Absensi**: Monitoring kehadiran TU hari ini

### API Endpoints
```php
// Dashboard Analytics
GET /api/tu/dashboard
GET /api/tu/income-summary
GET /api/tu/expense-summary
GET /api/tu/spp-reminders
GET /api/tu/approval-notifications
GET /api/tu/attendance-status
```

## 📅 Absensi Karyawan

### Fitur
- **Absen Online**: QR Code / GPS-based attendance
- **Rekap Mingguan/Bulanan**: Laporan kehadiran
- **Log Aktivitas**: Audit trail absensi

### Database Schema
```sql
CREATE TABLE attendance_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    check_in DATETIME,
    check_out DATETIME,
    location VARCHAR(255),
    status ENUM('present', 'late', 'absent', 'sick', 'leave'),
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 💰 Manajemen Cashflow

### Pemasukan
1. **SPP** - Pembayaran SPP siswa
2. **Eskul** - Biaya ekstrakurikuler
3. **Buku** - Penjualan buku pelajaran
4. **Kegiatan** - Biaya kegiatan sekolah
5. **AJP** - Anggaran Jasa Pengguna
6. **Seragam** - Penjualan seragam
7. **Infaq** - Sumbangan infaq
8. **Koperasi** - Transaksi koperasi

### Pengeluaran
1. **Gaji Karyawan** - Penggajian staff
2. **Operasional** - Biaya operasional sekolah
3. **Alat Kantor** - Pembelian peralatan

### API Endpoints
```php
// Cashflow Management
GET /api/tu/cashflow/income
POST /api/tu/cashflow/income
GET /api/tu/cashflow/expense
POST /api/tu/cashflow/expense
GET /api/tu/cashflow/summary
```

## 🔄 Workflow Persetujuan

### Status Transaksi
- `pending` - Menunggu persetujuan
- `approved` - Disetujui
- `rejected` - Ditolak
- `completed` - Selesai

### Role-based Approval
- **TU Staff**: Input transaksi
- **Kepala TU**: Approval transaksi < 5 juta
- **Kepala Sekolah**: Approval transaksi > 5 juta

## 📊 Reporting

### Laporan yang Tersedia
1. **Laporan Cashflow Harian/Bulanan**
2. **Laporan SPP per Kelas**
3. **Laporan Absensi Karyawan**
4. **Laporan Pengeluaran per Kategori**
5. **Laporan Reminder Tagihan**

### Export Format
- PDF (untuk cetak)
- Excel (untuk analisis)
- CSV (untuk backup)

## 🔐 Security & Permissions

### Role TU
- View dashboard
- Input transaksi
- View reports
- Manage attendance

### Role Kepala TU
- All TU permissions
- Approve transactions
- Manage cashflow
- View financial reports

## 📱 Frontend Components

### Dashboard Components
```jsx
// Dashboard TU
<TUDashboard />
<IncomeSummary />
<ExpenseSummary />
<SPPReminders />
<ApprovalNotifications />
<AttendanceStatus />

// Cashflow Components
<CashflowForm />
<TransactionList />
<CashflowSummary />
<ApprovalWorkflow />

// Attendance Components
<AttendanceForm />
<AttendanceReport />
<AttendanceLog />
```

## 🎯 Key Performance Indicators (KPI)

### Financial KPIs
- Total pemasukan bulanan
- Total pengeluaran bulanan
- Saldo kas
- SPP collection rate
- Expense ratio

### Operational KPIs
- Attendance rate
- Approval processing time
- Transaction accuracy
- Report generation time
