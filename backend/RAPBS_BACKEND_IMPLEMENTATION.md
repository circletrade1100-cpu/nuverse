# RAPBS Backend Implementation

## 📋 Overview

Backend lengkap untuk modul RAPBS (Rencana Anggaran Pendapatan dan Belanja Sekolah) dengan Laravel.

## ✅ Komponen yang Telah Dibuat

### 1. **Migrations** (10 files)
Database schema untuk semua tabel RAPBS:

- ✅ `academic_years` - Tahun ajaran
- ✅ `activity_categories` - Kategori kegiatan
- ✅ `funding_sources` - Sumber dana
- ✅ `rapbs_plans` - Rencana RAPBS
- ✅ `budget_breakdowns` - Breakdown anggaran
- ✅ `rapbs_documents` - Dokumen rencana
- ✅ `rapbs_realizations` - Realisasi anggaran
- ✅ `realization_documents` - Dokumen realisasi
- ✅ `activity_notes` - Catatan kegiatan
- ✅ `rapbs_users` - User roles & permissions untuk RAPBS

### 2. **Models** (10 files)
Eloquent models dengan relationships lengkap:

- ✅ `AcademicYear.php`
- ✅ `ActivityCategory.php`
- ✅ `FundingSource.php`
- ✅ `RapbsPlan.php`
- ✅ `BudgetBreakdown.php`
- ✅ `RapbsDocument.php`
- ✅ `RapbsRealization.php`
- ✅ `RealizationDocument.php`
- ✅ `ActivityNote.php`
- ✅ `RapbsUser.php`

### 3. **Seeders** (5 files)
Data awal untuk testing:

- ✅ `AcademicYearSeeder.php` - 3 tahun ajaran
- ✅ `ActivityCategorySeeder.php` - Kategori income & expense
- ✅ `FundingSourceSeeder.php` - 7 sumber dana
- ✅ `RapbsSeeder.php` - Sample rencana RAPBS
- ✅ `RapbsUserSeeder.php` - Sample RAPBS user roles

### 4. **Controllers** (6 files)
API controllers dengan CRUD lengkap:

- ✅ `RAPBSDashboardController.php` - Dashboard data
- ✅ `RAPBSPlanController.php` - Manajemen rencana
- ✅ `RAPBSRealizationController.php` - Manajemen realisasi
- ✅ `RAPBSMasterDataController.php` - Master data
- ✅ `RAPBSReportController.php` - Laporan
- ✅ `RAPBSUserController.php` - User roles & permissions

### 5. **Routes**
✅ 48+ API endpoints di `routes/api.php`

## 🚀 Setup & Installation

### 1. Run Migrations

```bash
cd backend
php artisan migrate
```

### 2. Run Seeders

```bash
php artisan db:seed --class=AcademicYearSeeder
php artisan db:seed --class=ActivityCategorySeeder
php artisan db:seed --class=FundingSourceSeeder
php artisan db:seed --class=RapbsSeeder
```

Atau jalankan semua seeder:

```bash
php artisan db:seed
```

### 3. Create Storage Link (untuk upload dokumen)

```bash
php artisan storage:link
```

## 📡 API Endpoints

Base URL: `https://nurverse.id/api`

### Dashboard

```
GET /rapbs/dashboard
```

Query params:
- `academic_year_id` (optional)
- `start_date` (optional)
- `end_date` (optional)

Response:
```json
{
  "success": true,
  "data": {
    "budget_summary": {
      "total_budget": 500000000,
      "total_realization": 350000000,
      "remaining_budget": 150000000,
      "utilization_rate": 70.0
    },
    "funding_sources": [...],
    "category_breakdown": [...]
  }
}
```

### Master Data - Academic Years

```
GET    /rapbs/academic-years
GET    /rapbs/academic-years/{id}
POST   /rapbs/academic-years
PUT    /rapbs/academic-years/{id}
DELETE /rapbs/academic-years/{id}
```

### Master Data - Activity Categories

```
GET    /rapbs/activity-categories
GET    /rapbs/activity-categories/{id}
POST   /rapbs/activity-categories
PUT    /rapbs/activity-categories/{id}
DELETE /rapbs/activity-categories/{id}
```

### Master Data - Funding Sources

```
GET    /rapbs/funding-sources
GET    /rapbs/funding-sources/{id}
POST   /rapbs/funding-sources
PUT    /rapbs/funding-sources/{id}
DELETE /rapbs/funding-sources/{id}
```

### RAPBS Plans

```
GET    /rapbs/plans
GET    /rapbs/plans/{id}
POST   /rapbs/plans
PUT    /rapbs/plans/{id}
DELETE /rapbs/plans/{id}
PUT    /rapbs/plans/{id}/submit
PUT    /rapbs/plans/{id}/approve
PUT    /rapbs/plans/{id}/reject
```

Query params untuk GET /plans:
- `search`
- `academic_year_id`
- `activity_category_id`
- `funding_source_id`
- `status` (draft, submitted, approved, rejected)
- `priority` (low, medium, high, urgent)
- `per_page` (default: 10)

### Budget Breakdowns

```
GET    /rapbs/plans/{planId}/breakdown
POST   /rapbs/plans/{planId}/breakdown
PUT    /rapbs/plans/{planId}/breakdown/{breakdownId}
DELETE /rapbs/plans/{planId}/breakdown/{breakdownId}
```

### Plan Documents

```
GET    /rapbs/plans/{planId}/documents
POST   /rapbs/plans/{planId}/upload-document
DELETE /rapbs/plans/{planId}/documents/{documentId}
```

Upload document payload:
```
Content-Type: multipart/form-data

document_type: proposal|budget_detail|supporting_doc
file: [file]
```

### Activity Notes

```
GET  /rapbs/plans/{planId}/notes
POST /rapbs/plans/{planId}/notes
```

### Realizations

```
GET    /rapbs/realizations
GET    /rapbs/realizations/{id}
POST   /rapbs/realizations
PUT    /rapbs/realizations/{id}
DELETE /rapbs/realizations/{id}
```

Query params untuk GET /realizations:
- `search`
- `rapbs_plan_id`
- `start_date`
- `end_date`
- `payment_method` (cash, transfer, check)
- `per_page` (default: 10)

### Realization Documents

```
GET /rapbs/realizations/{realizationId}/documents
POST /rapbs/realizations/{realizationId}/upload-document
PUT /rapbs/realizations/{realizationId}/documents/{documentId}/validate
```

### Reports

```
GET /rapbs/reports/plan-vs-realization
GET /rapbs/reports/realization/summary
GET /rapbs/reports/variance-analysis
GET /rapbs/reports/performance
```

### RAPBS Users Management

```
GET    /rapbs/users
GET    /rapbs/users/{id}
GET    /rapbs/users/by-user/{userId}
POST   /rapbs/users
PUT    /rapbs/users/{id}
DELETE /rapbs/users/{id}
GET    /rapbs/users/role/{role}
GET    /rapbs/available-users
```

Roles available:
- `planner` - Dapat membuat dan mengedit rencana
- `approver` - Dapat menyetujui/menolak rencana
- `executor` - Dapat melakukan realisasi
- `viewer` - Hanya dapat melihat data

## 📝 Request Examples

### Create RAPBS Plan

```bash
POST /api/rapbs/plans
Authorization: Bearer {token}
Content-Type: application/json

{
  "academic_year_id": 1,
  "activity_category_id": 5,
  "funding_source_id": 1,
  "title": "Pengadaan Komputer Lab",
  "description": "Pengadaan 20 unit komputer baru untuk laboratorium",
  "planned_amount": 50000000,
  "priority": "high"
}
```

### Create Realization

```bash
POST /api/rapbs/realizations
Authorization: Bearer {token}
Content-Type: application/json

{
  "rapbs_plan_id": 1,
  "transaction_date": "2024-10-15",
  "amount": 25000000,
  "description": "Pembayaran DP komputer",
  "vendor_name": "PT Teknologi Komputer",
  "payment_method": "transfer",
  "reference_number": "TRF-2024-001"
}
```

### Add Budget Breakdown

```bash
POST /api/rapbs/plans/1/breakdown
Authorization: Bearer {token}
Content-Type: application/json

{
  "item_name": "Komputer Desktop",
  "quantity": 20,
  "unit_price": 2500000,
  "notes": "Spesifikasi: Core i5, RAM 8GB, SSD 256GB"
}
```

## 🔐 Authentication

Semua endpoints RAPBS berada di dalam middleware `auth:sanctum`, sehingga memerlukan token authentication.

Header yang diperlukan:
```
Authorization: Bearer {your_token_here}
Content-Type: application/json
Accept: application/json
```

## 🎯 Workflow Status

### RAPBS Plan Status Flow:
1. **draft** → User membuat rencana
2. **submitted** → User submit untuk approval
3. **approved** → Approver menyetujui
4. **rejected** → Approver menolak

### Document Validation Status:
1. **pending** → Dokumen baru diupload
2. **validated** → Dokumen tervalidasi
3. **rejected** → Dokumen ditolak

## 🔄 Relationships

```
AcademicYear
  └─ hasMany → RapbsPlan

ActivityCategory
  └─ hasMany → RapbsPlan
  └─ belongsTo → ActivityCategory (parent)
  └─ hasMany → ActivityCategory (children)

FundingSource
  └─ hasMany → RapbsPlan

RapbsPlan
  └─ belongsTo → AcademicYear
  └─ belongsTo → ActivityCategory
  └─ belongsTo → FundingSource
  └─ belongsTo → User (submittedBy)
  └─ belongsTo → User (approvedBy)
  └─ hasMany → BudgetBreakdown
  └─ hasMany → RapbsDocument
  └─ hasMany → RapbsRealization
  └─ hasMany → ActivityNote

RapbsRealization
  └─ belongsTo → RapbsPlan
  └─ belongsTo → User (createdBy)
  └─ hasMany → RealizationDocument
```

## 📊 Database Indexes

Indexes telah ditambahkan untuk optimasi query:

- `academic_years`: status
- `activity_categories`: budget_type
- `funding_sources`: type, status
- `rapbs_plans`: status, priority, academic_year_id
- `budget_breakdowns`: rapbs_plan_id
- `rapbs_documents`: rapbs_plan_id, document_type
- `rapbs_realizations`: rapbs_plan_id, transaction_date, payment_method
- `realization_documents`: realization_id, validation_status
- `activity_notes`: rapbs_plan_id, note_type

## 🛠️ Testing

### Test API dengan cURL

```bash
# Get Dashboard
curl -X GET "https://nurverse.id/api/rapbs/dashboard" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"

# Get Plans
curl -X GET "https://nurverse.id/api/rapbs/plans?status=approved" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"

# Create Plan
curl -X POST "https://nurverse.id/api/rapbs/plans" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "academic_year_id": 1,
    "activity_category_id": 5,
    "funding_source_id": 1,
    "title": "Test Plan",
    "description": "Test Description",
    "planned_amount": 10000000,
    "priority": "medium"
  }'
```

## 📁 File Structure

```
backend/
├── app/
│   ├── Http/Controllers/
│   │   ├── RAPBSDashboardController.php
│   │   ├── RAPBSPlanController.php
│   │   ├── RAPBSRealizationController.php
│   │   ├── RAPBSMasterDataController.php
│   │   └── RAPBSReportController.php
│   └── Models/
│       ├── AcademicYear.php
│       ├── ActivityCategory.php
│       ├── ActivityNote.php
│       ├── BudgetBreakdown.php
│       ├── FundingSource.php
│       ├── RapbsDocument.php
│       ├── RapbsPlan.php
│       ├── RapbsRealization.php
│       └── RealizationDocument.php
├── database/
│   ├── migrations/
│   │   ├── 2024_01_20_000001_create_academic_years_table.php
│   │   ├── 2024_01_20_000002_create_activity_categories_table.php
│   │   ├── 2024_01_20_000003_create_funding_sources_table.php
│   │   ├── 2024_01_20_000004_create_rapbs_plans_table.php
│   │   ├── 2024_01_20_000005_create_budget_breakdowns_table.php
│   │   ├── 2024_01_20_000006_create_rapbs_documents_table.php
│   │   ├── 2024_01_20_000007_create_rapbs_realizations_table.php
│   │   ├── 2024_01_20_000008_create_realization_documents_table.php
│   │   └── 2024_01_20_000009_create_activity_notes_table.php
│   └── seeders/
│       ├── AcademicYearSeeder.php
│       ├── ActivityCategorySeeder.php
│       ├── FundingSourceSeeder.php
│       └── RapbsSeeder.php
└── routes/
    └── api.php (RAPBS routes added)
```

## ✨ Features

### Dashboard
- ✅ Budget summary dengan utilisasi
- ✅ Breakdown per sumber dana
- ✅ Breakdown per kategori

### RAPBS Plans
- ✅ CRUD lengkap
- ✅ Search & filter
- ✅ Approval workflow (submit, approve, reject)
- ✅ Budget breakdown management
- ✅ Document upload
- ✅ Activity notes

### Realizations
- ✅ CRUD lengkap
- ✅ Filter by date range
- ✅ Multiple payment methods
- ✅ Document upload
- ✅ Document validation

### Reports
- ✅ Plan vs Realization
- ✅ Realization Summary
- ✅ Variance Analysis
- ✅ Performance Report

## 🔒 Security

- ✅ Authentication dengan Laravel Sanctum
- ✅ Authorization checks (only draft can be edited/deleted)
- ✅ File upload validation (size, type)
- ✅ SQL injection protection (Eloquent ORM)
- ✅ XSS protection (Laravel built-in)

## 📈 Next Steps

1. ✅ Migrations, Models, Seeders, Controllers dibuat
2. ✅ Routes didefinisikan
3. ⏳ Test endpoints dengan Postman/cURL
4. ⏳ Setup permissions untuk roles
5. ⏳ Add middleware untuk role-based access
6. ⏳ Implement PDF generation untuk reports

## 🐛 Troubleshooting

### Migration Error
```bash
php artisan migrate:fresh --seed
```

### Permission Denied pada Storage
```bash
chmod -R 775 storage
chown -R www-data:www-data storage
```

### Token Invalid
Pastikan token di-generate dengan benar dan belum expired.

## 📞 Support

Dokumentasi lengkap ada di `docs/modules/RAPBS.md`

---

**Status**: ✅ Backend Implementation Complete
**Date**: October 2024
**Version**: 1.0.0

