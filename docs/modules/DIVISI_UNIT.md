# Modul DIVISI/UNIT

## 💰 Pemasukan & Pengeluaran per Sumber

### Sumber Dana
1. **Reguler**
   - SPP siswa
   - Biaya ekstrakurikuler
   - Biaya kegiatan

2. **BOS (Bantuan Operasional Sekolah)**
   - Dana BOS Pusat
   - Dana BOS Provinsi
   - Dana BOS Kabupaten/Kota

3. **Lainnya**
   - Sumbangan
   - Hibah
   - Dana CSR
   - Dana Darurat

### Database Schema
```sql
CREATE TABLE funding_sources (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    type ENUM('regular', 'bos', 'other'),
    description TEXT,
    status ENUM('active', 'inactive'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE divisional_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    division_id BIGINT,
    funding_source_id BIGINT,
    transaction_type ENUM('income', 'expense'),
    amount DECIMAL(15,2),
    description TEXT,
    transaction_date DATE,
    reference_number VARCHAR(100),
    created_by BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### API Endpoints
```php
// Funding Source Management
GET /api/division/funding-sources
POST /api/division/funding-sources
PUT /api/division/funding-sources/{id}

// Transaction Management
GET /api/division/transactions
POST /api/division/transactions
GET /api/division/transactions/income
GET /api/division/transactions/expense

// Reports
GET /api/division/reports/summary
GET /api/division/reports/funding-breakdown
GET /api/division/reports/expense-analysis
```

## 👥 Presensi Guru

### Fitur Presensi
- **Upload Surat Sakit/Ijin**: Upload dokumen
- **Approval Workflow**: Workflow persetujuan
- **Attendance Tracking**: Tracking kehadiran
- **Document Management**: Manajemen dokumen

### Document Upload
```sql
CREATE TABLE teacher_attendance_documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    teacher_id BIGINT,
    attendance_date DATE,
    document_type ENUM('sick_leave', 'permit', 'other'),
    document_file VARCHAR(255),
    file_name VARCHAR(200),
    file_size BIGINT,
    mime_type VARCHAR(100),
    status ENUM('pending', 'approved', 'rejected'),
    approved_by BIGINT,
    approved_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### API Endpoints
```php
// Document Upload
POST /api/division/attendance/upload-document
GET /api/division/attendance/documents
PUT /api/division/attendance/documents/{id}/approve
PUT /api/division/attendance/documents/{id}/reject

// Attendance Management
GET /api/division/attendance/teachers
POST /api/division/attendance/input
GET /api/division/attendance/report
```

## 📤 Upload Pengeluaran

### Fitur Upload
- **Input FPU/Kuitansi**: Input bukti pengeluaran
- **Document Upload**: Upload dokumen
- **Approval Process**: Proses persetujuan
- **Expense Tracking**: Tracking pengeluaran

### Expense Management
```sql
CREATE TABLE expense_documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    division_id BIGINT,
    expense_date DATE,
    amount DECIMAL(15,2),
    description TEXT,
    vendor_name VARCHAR(200),
    document_type ENUM('fpu', 'receipt', 'invoice', 'other'),
    document_file VARCHAR(255),
    file_name VARCHAR(200),
    file_size BIGINT,
    mime_type VARCHAR(100),
    status ENUM('pending', 'approved', 'rejected'),
    approved_by BIGINT,
    approved_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### API Endpoints
```php
// Expense Upload
POST /api/division/expense/upload
GET /api/division/expense/documents
PUT /api/division/expense/documents/{id}/approve
PUT /api/division/expense/documents/{id}/reject

// Expense Management
GET /api/division/expense/summary
GET /api/division/expense/report
POST /api/division/expense/input
```

## 📊 Dashboard Divisi

### Key Metrics
- **Total Income**: Total pemasukan
- **Total Expenses**: Total pengeluaran
- **Budget Utilization**: Pemanfaatan anggaran
- **Document Pending**: Dokumen menunggu approval

### Real-time Monitoring
- **Live Transactions**: Transaksi real-time
- **Document Status**: Status dokumen
- **Approval Queue**: Antrian persetujuan
- **Budget Alerts**: Alert anggaran

## 🔄 Workflow Management

### Document Approval Workflow
1. **Staff**: Upload dokumen
2. **Supervisor**: Review & approval
3. **Manager**: Final approval
4. **Finance**: Recording

### Budget Control
- **Monthly Budget**: Anggaran bulanan
- **Expense Limits**: Batas pengeluaran
- **Budget Alerts**: Notifikasi over budget
- **Budget vs Actual**: Perbandingan

## 📈 Performance Analytics

### Division Performance
- **Revenue per Division**: Pemasukan per divisi
- **Expense per Division**: Pengeluaran per divisi
- **Budget Efficiency**: Efisiensi anggaran
- **Document Processing**: Proses dokumen

### Funding Source Analysis
- **BOS Utilization**: Pemanfaatan dana BOS
- **Regular Fund Usage**: Penggunaan dana reguler
- **Other Fund Sources**: Sumber dana lainnya
- **Fund Allocation**: Alokasi dana

## 🔐 Security & Permissions

### Role Division Manager
- View division performance
- Manage transactions
- Approve documents
- View reports

### Role Staff
- Upload documents
- Input transactions
- View own data
- Submit requests

### Role Finance
- View all transactions
- Generate reports
- Manage budgets
- Audit trails

## 📱 Frontend Components

### Division Management Components
```jsx
// Division Dashboard
<DivisionDashboard />
<FundingSummary />
<ExpenseOverview />

// Transaction Components
<TransactionForm />
<TransactionList />
<TransactionSummary />

// Document Components
<DocumentUpload />
<DocumentApproval />
<DocumentHistory />

// Report Components
<DivisionReport />
<FundingReport />
<ExpenseReport />
```

## 🎯 Key Performance Indicators (KPI)

### Financial KPIs
- Total income per division
- Total expenses per division
- Budget utilization rate
- Fund source efficiency

### Operational KPIs
- Document processing time
- Approval response time
- Document accuracy rate
- Budget compliance rate

## 📊 Reporting & Analytics

### Standard Reports
1. **Monthly Financial Report**
2. **Funding Source Report**
3. **Expense Analysis Report**
4. **Document Processing Report**

### Advanced Analytics
- Revenue trend analysis
- Expense pattern analysis
- Budget optimization
- Fund allocation analysis

## 🔔 Notifications

### Notification Types
- **Document Approval**: Notifikasi approval dokumen
- **Budget Alerts**: Alert anggaran
- **Expense Reminders**: Pengingat pengeluaran
- **Approval Queue**: Antrian persetujuan

### Notification Channels
- **In-app**: Notifikasi dalam aplikasi
- **Email**: Notifikasi email
- **SMS**: Notifikasi SMS
- **Push**: Notifikasi push

## 📋 Document Management

### Document Types
- **FPU (Faktur Pajak Umum)**: Bukti pengeluaran
- **Kuitansi**: Bukti pembayaran
- **Invoice**: Tagihan
- **Surat Sakit/Ijin**: Dokumen kehadiran

### Document Workflow
1. **Upload**: Upload dokumen
2. **Validation**: Validasi dokumen
3. **Approval**: Persetujuan
4. **Recording**: Pencatatan
5. **Archive**: Arsip

## 📈 Budget Management

### Budget Planning
- **Annual Budget**: Anggaran tahunan
- **Monthly Allocation**: Alokasi bulanan
- **Division Budget**: Anggaran per divisi
- **Fund Source Budget**: Anggaran per sumber dana

### Budget Monitoring
- **Real-time Tracking**: Tracking real-time
- **Budget Alerts**: Alert anggaran
- **Variance Analysis**: Analisis varians
- **Forecasting**: Peramalan
