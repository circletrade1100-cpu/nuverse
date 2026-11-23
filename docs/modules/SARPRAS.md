# Modul SARPRAS (Sarana Prasarana)

## 📦 Inventaris Barang & Aset

### Kategori Aset
1. **Aset Tetap**
   - Bangunan & Gedung
   - Kendaraan
   - Peralatan Kantor
   - Peralatan Laboratorium
   - Peralatan Olahraga

2. **Aset Bergerak**
   - Komputer & Laptop
   - Printer & Scanner
   - Furniture
   - Alat Tulis Kantor (ATK)

3. **Aset Digital**
   - Software Lisensi
   - Domain & Hosting
   - Cloud Storage

### Database Schema
```sql
CREATE TABLE inventory_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_code VARCHAR(50) UNIQUE,
    name VARCHAR(200),
    category_id BIGINT,
    sub_category VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE,
    purchase_price DECIMAL(15,2),
    current_value DECIMAL(15,2),
    location VARCHAR(200),
    status ENUM('active', 'maintenance', 'damaged', 'disposed'),
    condition ENUM('excellent', 'good', 'fair', 'poor'),
    warranty_expiry DATE,
    supplier VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE inventory_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    description TEXT,
    parent_id BIGINT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 📊 Penyusutan & Audit Barang

### Metode Penyusutan
1. **Garis Lurus**: Untuk aset dengan umur ekonomis tetap
2. **Saldo Menurun**: Untuk aset teknologi
3. **Unit Produksi**: Untuk aset berdasarkan penggunaan

### Perhitungan Penyusutan
```php
// Contoh perhitungan penyusutan
$depreciation_rate = 0.2; // 20% per tahun
$current_value = $purchase_price * pow(1 - $depreciation_rate, $years_used);
```

### Audit Trail
- **Tanggal Audit**: Kapan audit dilakukan
- **Auditor**: Siapa yang melakukan audit
- **Kondisi Sebelum**: Status sebelum audit
- **Kondisi Sesudah**: Status setelah audit
- **Temuan**: Hasil audit
- **Rekomendasi**: Saran perbaikan

### Database Schema
```sql
CREATE TABLE depreciation_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_id BIGINT,
    depreciation_date DATE,
    depreciation_amount DECIMAL(15,2),
    current_value DECIMAL(15,2),
    method VARCHAR(50),
    calculated_by BIGINT,
    created_at TIMESTAMP
);

CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_id BIGINT,
    audit_date DATE,
    auditor_id BIGINT,
    condition_before ENUM('excellent', 'good', 'fair', 'poor'),
    condition_after ENUM('excellent', 'good', 'fair', 'poor'),
    findings TEXT,
    recommendations TEXT,
    created_at TIMESTAMP
);
```

## 🔧 Pengajuan & Realisasi Perbaikan

### Jenis Perbaikan
1. **Preventive Maintenance**: Perawatan rutin
2. **Corrective Maintenance**: Perbaikan kerusakan
3. **Emergency Repair**: Perbaikan darurat
4. **Upgrade**: Peningkatan fasilitas

### Workflow Pengajuan
1. **Pengguna**: Submit request perbaikan
2. **SARPRAS**: Review & assign technician
3. **Technician**: Lakukan perbaikan
4. **Quality Check**: Verifikasi hasil
5. **Completion**: Update status

### Database Schema
```sql
CREATE TABLE repair_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_id BIGINT,
    requester_id BIGINT,
    request_date DATE,
    problem_description TEXT,
    priority ENUM('low', 'medium', 'high', 'urgent'),
    estimated_cost DECIMAL(15,2),
    status ENUM('pending', 'approved', 'in_progress', 'completed', 'rejected'),
    assigned_technician_id BIGINT,
    start_date DATE,
    completion_date DATE,
    actual_cost DECIMAL(15,2),
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 📅 Jadwal Maintenance Berkala

### Jenis Maintenance
1. **Daily**: Pembersihan rutin
2. **Weekly**: Pengecekan sistem
3. **Monthly**: Perawatan preventif
4. **Quarterly**: Inspeksi mendalam
5. **Yearly**: Overhaul besar

### Scheduling System
```php
// Maintenance Schedule
{
    "item_id": 1,
    "maintenance_type": "preventive",
    "frequency": "monthly",
    "next_schedule": "2024-02-15",
    "technician_id": 5,
    "estimated_duration": "2 hours",
    "required_materials": ["oil", "filter"],
    "checklist": [
        "Check engine oil",
        "Inspect belts",
        "Test functionality"
    ]
}
```

### Database Schema
```sql
CREATE TABLE maintenance_schedules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_id BIGINT,
    maintenance_type ENUM('preventive', 'corrective', 'emergency', 'upgrade'),
    frequency VARCHAR(50),
    last_maintenance DATE,
    next_maintenance DATE,
    technician_id BIGINT,
    estimated_duration VARCHAR(50),
    required_materials TEXT,
    checklist TEXT,
    status ENUM('scheduled', 'in_progress', 'completed', 'overdue'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 📊 Report

### Laporan yang Tersedia
1. **Laporan Inventaris**
   - Total aset per kategori
   - Nilai aset saat ini
   - Aset yang perlu maintenance

2. **Laporan Penyusutan**
   - Penyusutan bulanan/tahunan
   - Nilai buku aset
   - Aset yang sudah habis masa pakai

3. **Laporan Perbaikan**
   - Request perbaikan per periode
   - Biaya perbaikan
   - Waktu penyelesaian

4. **Laporan Maintenance**
   - Jadwal maintenance
   - Compliance rate
   - Preventive vs corrective ratio

### API Endpoints
```php
// Inventory Management
GET /api/sarpras/inventory
POST /api/sarpras/inventory
PUT /api/sarpras/inventory/{id}
DELETE /api/sarpras/inventory/{id}

// Maintenance Management
GET /api/sarpras/maintenance/schedule
POST /api/sarpras/maintenance/request
PUT /api/sarpras/maintenance/{id}/status

// Reports
GET /api/sarpras/reports/inventory
GET /api/sarpras/reports/depreciation
GET /api/sarpras/reports/maintenance
GET /api/sarpras/reports/repair
```

## 🔐 Security & Permissions

### Role SARPRAS Staff
- View inventory
- Update item status
- Create maintenance schedule
- Generate reports

### Role Technician
- View assigned tasks
- Update repair progress
- Complete maintenance
- Upload photos

### Role Manager
- Approve repair requests
- View all reports
- Manage budget
- Set priorities

## 📱 Frontend Components

### Inventory Components
```jsx
// Inventory Management
<InventoryList />
<InventoryForm />
<InventoryDetail />
<InventorySearch />

// Maintenance Components
<MaintenanceSchedule />
<RepairRequestForm />
<MaintenanceTracker />
<MaintenanceReport />

// Asset Tracking
<AssetTracker />
<AssetHistory />
<AssetValuation />
<AssetAudit />
```

## 🎯 Key Performance Indicators (KPI)

### Asset Management KPIs
- Asset utilization rate
- Maintenance compliance rate
- Repair response time
- Asset lifecycle cost

### Financial KPIs
- Total asset value
- Depreciation expense
- Maintenance cost per asset
- Asset ROI

## 📊 Analytics & Dashboard

### Dashboard Metrics
- Total aset aktif
- Aset yang perlu maintenance
- Biaya maintenance bulan ini
- Compliance rate maintenance

### Advanced Analytics
- Asset performance analysis
- Maintenance cost trends
- Asset lifecycle optimization
- Predictive maintenance
