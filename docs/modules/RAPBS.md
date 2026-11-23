# Modul RAPBS (Rencana Anggaran Pendapatan dan Belanja Sekolah)

## 📊 Dashboard RAPBS

### Key Metrics
- **Total Anggaran**: Total anggaran yang dialokasikan
- **Realisasi**: Realisasi penggunaan dana
- **Sisa Anggaran**: Sisa dana yang tersedia
- **Grafik Penggunaan**: Visualisasi penggunaan dana

### Dashboard Analytics
```php
// RAPBS Dashboard Data
{
    "budget_summary": {
        "total_budget": 500000000,
        "total_realization": 350000000,
        "remaining_budget": 150000000,
        "utilization_rate": 70.0
    },
    "funding_sources": [
        {
            "source": "BOS Pusat",
            "budget": 300000000,
            "realization": 200000000,
            "percentage": 66.7
        },
        {
            "source": "SPP",
            "budget": 200000000,
            "realization": 150000000,
            "percentage": 75.0
        }
    ],
    "category_breakdown": [
        {
            "category": "Operasional",
            "budget": 200000000,
            "realization": 150000000
        },
        {
            "category": "Sarana Prasarana",
            "budget": 150000000,
            "realization": 100000000
        }
    ]
}
```

## 📋 Master Data

### A. Tahun Ajaran
```sql
CREATE TABLE academic_years (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    year VARCHAR(10),
    start_date DATE,
    end_date DATE,
    status ENUM('active', 'inactive'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### B. Kategori Kegiatan
```sql
CREATE TABLE activity_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    description TEXT,
    parent_id BIGINT NULL,
    budget_type ENUM('income', 'expense'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### C. Sumber Dana
```sql
CREATE TABLE funding_sources (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    type ENUM('bos', 'spp', 'donation', 'other'),
    description TEXT,
    status ENUM('active', 'inactive'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### D. Pengguna/User
```sql
CREATE TABLE rapbs_users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    role ENUM('planner', 'approver', 'executor', 'viewer'),
    division_id BIGINT,
    permissions TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 📝 Rencana RAPBS

### A. Tambah Rencana
```sql
CREATE TABLE rapbs_plans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    academic_year_id BIGINT,
    activity_category_id BIGINT,
    funding_source_id BIGINT,
    title VARCHAR(200),
    description TEXT,
    planned_amount DECIMAL(15,2),
    priority ENUM('low', 'medium', 'high', 'urgent'),
    status ENUM('draft', 'submitted', 'approved', 'rejected'),
    submitted_by BIGINT,
    approved_by BIGINT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### B. Breakdown Anggaran
```sql
CREATE TABLE budget_breakdowns (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rapbs_plan_id BIGINT,
    item_name VARCHAR(200),
    quantity INT,
    unit_price DECIMAL(15,2),
    total_amount DECIMAL(15,2),
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### C. Upload Dokumen
```sql
CREATE TABLE rapbs_documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rapbs_plan_id BIGINT,
    document_type ENUM('proposal', 'budget_detail', 'supporting_doc'),
    file_name VARCHAR(200),
    file_path VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by BIGINT,
    created_at TIMESTAMP
);
```

### D. Report
```php
// RAPBS Plan API Endpoints
GET /api/rapbs/plans
POST /api/rapbs/plans
PUT /api/rapbs/plans/{id}
GET /api/rapbs/plans/{id}/breakdown
POST /api/rapbs/plans/{id}/breakdown
POST /api/rapbs/plans/{id}/upload-document
GET /api/rapbs/plans/report
```

## 💰 Realisasi

### A. Tambah Transaksi
```sql
CREATE TABLE rapbs_realizations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rapbs_plan_id BIGINT,
    transaction_date DATE,
    amount DECIMAL(15,2),
    description TEXT,
    vendor_name VARCHAR(200),
    payment_method ENUM('cash', 'transfer', 'check'),
    reference_number VARCHAR(100),
    created_by BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### B. Validasi Bukti
```sql
CREATE TABLE realization_documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    realization_id BIGINT,
    document_type ENUM('receipt', 'invoice', 'fpu', 'other'),
    file_name VARCHAR(200),
    file_path VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    validation_status ENUM('pending', 'validated', 'rejected'),
    validated_by BIGINT,
    validated_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP
);
```

### C. Catatan Kegiatan
```sql
CREATE TABLE activity_notes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rapbs_plan_id BIGINT,
    note_type ENUM('progress', 'issue', 'completion'),
    title VARCHAR(200),
    content TEXT,
    created_by BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 📊 Report

### A. Cetak RAPBS
```php
// RAPBS Print API
GET /api/rapbs/print/plan/{id}
GET /api/rapbs/print/summary
GET /api/rapbs/print/detailed
```

### B. Realisasi Anggaran
```php
// Realization Report API
GET /api/rapbs/reports/realization
GET /api/rapbs/reports/realization/{plan_id}
GET /api/rapbs/reports/realization/summary
```

### C. Rencana vs Realisasi
```php
// Plan vs Realization API
GET /api/rapbs/reports/plan-vs-realization
GET /api/rapbs/reports/variance-analysis
GET /api/rapbs/reports/performance
```

## 🔄 Workflow Management

### Approval Workflow
1. **Planner**: Buat rencana RAPBS
2. **Reviewer**: Review rencana
3. **Approver**: Approval rencana
4. **Executor**: Eksekusi rencana
5. **Validator**: Validasi realisasi

### Status Management
- **Draft**: Rencana dalam penyusunan
- **Submitted**: Rencana diajukan
- **Under Review**: Sedang direview
- **Approved**: Disetujui
- **Rejected**: Ditolak
- **In Progress**: Sedang dieksekusi
- **Completed**: Selesai

## 📈 Budget Control

### Budget Monitoring
- **Real-time Tracking**: Tracking real-time
- **Budget Alerts**: Alert anggaran
- **Variance Analysis**: Analisis varians
- **Forecasting**: Peramalan

### Budget Rules
- **Maximum Budget**: Batas maksimal anggaran
- **Approval Threshold**: Batas approval
- **Budget Period**: Periode anggaran
- **Rollover Rules**: Aturan carry forward

## 🔐 Security & Permissions

### Role-based Access
- **Planner**: Buat dan edit rencana
- **Reviewer**: Review rencana
- **Approver**: Approval rencana
- **Executor**: Eksekusi rencana
- **Viewer**: Lihat laporan

### Data Security
- **Budget Confidentiality**: Kerahasiaan anggaran
- **Document Security**: Keamanan dokumen
- **Audit Trail**: Audit trail lengkap
- **Access Control**: Kontrol akses

## 📱 Frontend Components

### RAPBS Management Components
```jsx
// Dashboard Components
<RAPBSDashboard />
<BudgetSummary />
<RealizationChart />

// Plan Management
<RAPBSPlanForm />
<PlanBreakdown />
<PlanApproval />

// Realization Components
<RealizationForm />
<DocumentUpload />
<ValidationWorkflow />

// Report Components
<RAPBSReport />
<RealizationReport />
<PlanVsRealization />
```

## 🎯 Key Performance Indicators (KPI)

### Budget KPIs
- Budget utilization rate
- Realization accuracy
- Variance percentage
- Approval cycle time

### Operational KPIs
- Plan completion rate
- Document processing time
- Approval response time
- Budget compliance rate

## 📊 Analytics & Reporting

### Standard Reports
1. **RAPBS Summary Report**
2. **Realization Report**
3. **Variance Analysis Report**
4. **Performance Report**

### Advanced Analytics
- Budget trend analysis
- Realization pattern analysis
- Variance forecasting
- Performance optimization

## 🔔 Notifications

### Notification Types
- **Budget Alerts**: Alert anggaran
- **Approval Notifications**: Notifikasi approval
- **Realization Updates**: Update realisasi
- **Document Reminders**: Pengingat dokumen

### Notification Channels
- **In-app**: Notifikasi dalam aplikasi
- **Email**: Notifikasi email
- **SMS**: Notifikasi SMS
- **Push**: Notifikasi push
