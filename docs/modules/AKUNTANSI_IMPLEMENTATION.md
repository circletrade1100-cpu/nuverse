# 📊 MODUL AKUNTANSI - DOKUMENTASI IMPLEMENTASI

## ✅ STATUS IMPLEMENTASI: **SELESAI**

Modul Akuntansi telah berhasil diimplementasikan dengan fitur CRUD lengkap untuk:
- ✅ Chart of Accounts (Bagan Akun)
- ✅ Journal Entries (Jurnal Umum)
- ✅ Bank Accounts (Rekening Bank & Kas)
- ✅ Bank Transactions (Transaksi Bank)
- ✅ Fiscal Years (Tahun Fiskal)

---

## 📁 STRUKTUR FILE

### Backend

#### Migrations
```
backend/database/migrations/
├── 2025_10_17_214646_create_chart_of_accounts_table.php
├── 2025_10_17_214650_create_fiscal_years_table.php
├── 2025_10_17_214655_create_journal_entries_table.php
├── 2025_10_17_214700_create_journal_details_table.php
├── 2025_10_17_214705_create_bank_accounts_table.php
├── 2025_10_17_214718_create_bank_transactions_table.php
├── 2025_10_17_214723_create_bank_reconciliations_table.php
├── 2025_10_17_214726_create_account_balances_table.php
├── 2025_10_17_214743_create_journal_templates_table.php
└── 2025_10_17_214749_create_journal_template_details_table.php
```

#### Models
```
backend/app/Models/
├── ChartOfAccount.php
├── FiscalYear.php
├── JournalEntry.php
├── JournalDetail.php
├── BankAccount.php
├── BankTransaction.php
├── BankReconciliation.php
├── AccountBalance.php
├── JournalTemplate.php
└── JournalTemplateDetail.php
```

#### Controllers
```
backend/app/Http/Controllers/
├── ChartOfAccountsController.php
├── JournalController.php
├── BankAccountController.php
├── BankTransactionController.php
└── FiscalYearController.php
```

### Frontend

```
frontend/src/
├── services/
│   └── accountingService.ts
└── pages/
    ├── ChartOfAccounts.tsx
    ├── JournalEntries.tsx
    └── BankAccounts.tsx
```

---

## 🔌 API ENDPOINTS

Semua endpoints menggunakan prefix `/api/accounting` dan memerlukan autentikasi (`auth:sanctum`).

### Chart of Accounts
```http
GET    /api/accounting/chart-of-accounts          # List akun
POST   /api/accounting/chart-of-accounts          # Create akun
GET    /api/accounting/chart-of-accounts/{id}     # Detail akun
PUT    /api/accounting/chart-of-accounts/{id}     # Update akun
DELETE /api/accounting/chart-of-accounts/{id}     # Delete akun
```

**Query Parameters:**
- `page` - Halaman (default: 1)
- `per_page` - Jumlah per halaman (default: 15)
- `account_type` - Filter by type (asset, liability, equity, revenue, expense)
- `is_active` - Filter by status (true, false)
- `search` - Cari berdasarkan kode atau nama

### Journal Entries
```http
GET    /api/accounting/journal-entries            # List jurnal
POST   /api/accounting/journal-entries            # Create jurnal
GET    /api/accounting/journal-entries/{id}       # Detail jurnal
PUT    /api/accounting/journal-entries/{id}       # Update jurnal (draft only)
DELETE /api/accounting/journal-entries/{id}       # Delete jurnal (draft only)
POST   /api/accounting/journal-entries/{id}/post  # Post jurnal
POST   /api/accounting/journal-entries/{id}/void  # Void jurnal
```

**Query Parameters:**
- `page`, `per_page` - Pagination
- `status` - Filter by status (draft, posted, void)
- `entry_type` - Filter by type (automatic, manual, adjustment, reversing)
- `start_date`, `end_date` - Filter by date range
- `search` - Cari berdasarkan entry number, reference, atau deskripsi

### Bank Accounts
```http
GET    /api/accounting/bank-accounts              # List rekening
POST   /api/accounting/bank-accounts              # Create rekening
GET    /api/accounting/bank-accounts/{id}         # Detail rekening
PUT    /api/accounting/bank-accounts/{id}         # Update rekening
DELETE /api/accounting/bank-accounts/{id}         # Delete rekening
```

**Query Parameters:**
- `page`, `per_page` - Pagination
- `account_type` - Filter by type (cash, bank, investment)
- `status` - Filter by status (active, inactive)
- `search` - Cari berdasarkan account number, name, atau bank name

### Bank Transactions
```http
GET    /api/accounting/bank-transactions          # List transaksi
POST   /api/accounting/bank-transactions          # Create transaksi
GET    /api/accounting/bank-transactions/{id}     # Detail transaksi
PUT    /api/accounting/bank-transactions/{id}     # Update transaksi
DELETE /api/accounting/bank-transactions/{id}     # Delete transaksi
```

**Query Parameters:**
- `page`, `per_page` - Pagination
- `bank_account_id` - Filter by bank account
- `transaction_type` - Filter by type (deposit, withdrawal, transfer, adjustment)
- `status` - Filter by status (pending, completed, cancelled)
- `start_date`, `end_date` - Filter by date range
- `search` - Cari berdasarkan reference atau deskripsi

### Fiscal Years
```http
GET    /api/accounting/fiscal-years               # List tahun fiskal
POST   /api/accounting/fiscal-years               # Create tahun fiskal
GET    /api/accounting/fiscal-years/{id}          # Detail tahun fiskal
PUT    /api/accounting/fiscal-years/{id}          # Update tahun fiskal
DELETE /api/accounting/fiscal-years/{id}          # Delete tahun fiskal
POST   /api/accounting/fiscal-years/{id}/close    # Close tahun fiskal
```

---

## 💾 DATABASE SCHEMA

### chart_of_accounts
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | Primary key |
| account_code | varchar(20) | Kode akun (unique) |
| account_name | varchar(100) | Nama akun |
| account_type | enum | asset, liability, equity, revenue, expense |
| parent_id | bigint | FK ke chart_of_accounts |
| level | int | Level hierarchy |
| is_active | boolean | Status aktif |

### journal_entries
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | Primary key |
| entry_number | varchar(50) | Nomor jurnal (unique, auto) |
| entry_date | date | Tanggal jurnal |
| reference_number | varchar(100) | Nomor referensi |
| description | text | Deskripsi |
| entry_type | enum | automatic, manual, adjustment, reversing |
| source_module | varchar(50) | Modul sumber |
| source_id | bigint | ID sumber |
| total_debit | decimal(15,2) | Total debit |
| total_credit | decimal(15,2) | Total credit |
| status | enum | draft, posted, void |
| posted_by | bigint | FK ke users |
| posted_at | timestamp | Waktu post |
| created_by | bigint | FK ke users |

### journal_details
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | Primary key |
| journal_entry_id | bigint | FK ke journal_entries |
| account_id | bigint | FK ke chart_of_accounts |
| debit_amount | decimal(15,2) | Jumlah debit |
| credit_amount | decimal(15,2) | Jumlah credit |
| description | text | Deskripsi |

### bank_accounts
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | Primary key |
| account_number | varchar(50) | Nomor rekening |
| account_name | varchar(100) | Nama rekening |
| bank_name | varchar(100) | Nama bank |
| account_type | enum | cash, bank, investment |
| currency | varchar(10) | Mata uang (default: IDR) |
| opening_balance | decimal(15,2) | Saldo awal |
| current_balance | decimal(15,2) | Saldo saat ini |
| status | enum | active, inactive |

### bank_transactions
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | Primary key |
| bank_account_id | bigint | FK ke bank_accounts |
| transaction_date | date | Tanggal transaksi |
| transaction_type | enum | deposit, withdrawal, transfer, adjustment |
| reference_number | varchar(100) | Nomor referensi |
| description | text | Deskripsi |
| amount | decimal(15,2) | Jumlah |
| balance_after | decimal(15,2) | Saldo setelah |
| status | enum | pending, completed, cancelled |
| created_by | bigint | FK ke users |

### fiscal_years
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | Primary key |
| year_name | varchar(20) | Nama tahun fiskal |
| start_date | date | Tanggal mulai |
| end_date | date | Tanggal selesai |
| is_closed | boolean | Status tutup buku |
| closed_by | bigint | FK ke users |
| closed_at | timestamp | Waktu tutup buku |

---

## 🎯 FITUR UTAMA

### 1. Chart of Accounts (Bagan Akun)
- ✅ CRUD akun perkiraan
- ✅ Hierarchy akun (parent-child)
- ✅ 5 tipe akun: Asset, Liability, Equity, Revenue, Expense
- ✅ Status aktif/nonaktif
- ✅ Validasi: tidak bisa hapus akun yang punya sub-akun atau transaksi
- ✅ Filter dan search

### 2. Journal Entries (Jurnal Umum)
- ✅ CRUD jurnal entry
- ✅ Multi-detail entry (debit & credit)
- ✅ Auto-generate entry number (format: JE-YYYYMMDD-0001)
- ✅ Validasi: total debit = total credit
- ✅ Status workflow: Draft → Posted → Void
- ✅ Hanya draft yang bisa di-edit/delete
- ✅ 4 tipe entry: Manual, Automatic, Adjustment, Reversing
- ✅ Filter by status, type, date range

### 3. Bank Accounts (Rekening Bank & Kas)
- ✅ CRUD rekening bank dan kas
- ✅ 3 tipe: Cash, Bank, Investment
- ✅ Multi-currency support (IDR, USD, EUR)
- ✅ Track saldo berjalan (opening + current balance)
- ✅ Status aktif/nonaktif
- ✅ Validasi: tidak bisa hapus rekening yang punya transaksi

### 4. Bank Transactions (Transaksi Bank)
- ✅ CRUD transaksi bank/kas
- ✅ 4 tipe: Deposit, Withdrawal, Transfer, Adjustment
- ✅ Auto-update saldo rekening
- ✅ Validasi: cek saldo cukup untuk withdrawal/transfer
- ✅ Status: Pending, Completed, Cancelled

### 5. Fiscal Years (Tahun Fiskal)
- ✅ CRUD tahun fiskal
- ✅ Close fiscal year (tutup buku)
- ✅ Validasi: tidak bisa edit/delete tahun yang sudah ditutup

---

## 📖 CARA PENGGUNAAN

### Setup Awal

1. **Jalankan migration:**
```bash
cd backend
php artisan migrate
```

2. **Buat Chart of Accounts:**
   - Akses halaman Chart of Accounts
   - Tambah akun-akun dasar (101-Kas, 102-Bank, dll)
   - Buat hierarchy sesuai kebutuhan

3. **Buat Bank Accounts:**
   - Akses halaman Bank Accounts
   - Tambah rekening bank/kas yang digunakan
   - Set saldo awal

4. **Buat Fiscal Year:**
   - Buat tahun fiskal (misal: FY2025, 01 Jan - 31 Des)

### Workflow Journal Entry

1. **Create Draft:**
   - Buat jurnal baru dengan status draft
   - Tambah detail debit & credit
   - Pastikan balance (debit = credit)
   - Simpan

2. **Post Journal:**
   - Review draft journal
   - Klik tombol "Post"
   - Status berubah menjadi "Posted"
   - Jurnal sudah ter-record ke ledger

3. **Void (jika perlu):**
   - Untuk jurnal yang sudah posted
   - Klik tombol "Void"
   - Jurnal dibatalkan tapi tetap tercatat

### Workflow Bank Transaction

1. **Deposit:**
   - Pilih rekening
   - Set type = Deposit
   - Input jumlah
   - Saldo otomatis bertambah

2. **Withdrawal:**
   - Pilih rekening
   - Set type = Withdrawal
   - Input jumlah
   - System cek saldo cukup
   - Saldo otomatis berkurang

---

## 🔧 KONFIGURASI

### Environment
Tidak ada konfigurasi khusus yang diperlukan. Modul akuntansi menggunakan database dan authentication yang sudah ada.

### Permissions
Pastikan user memiliki role yang sesuai untuk mengakses modul akuntansi. Gunakan middleware `auth:sanctum` yang sudah terpasang di routes.

---

## 🚀 NEXT STEPS (Fitur Lanjutan)

Fitur yang bisa dikembangkan selanjutnya:

1. **Bank Reconciliation**
   - UI untuk rekonsiliasi bank
   - Match transaksi dengan statement

2. **Account Balances**
   - Auto-calculate dari journal entries
   - Monthly/yearly balance tracking

3. **Trial Balance Report**
   - Generate trial balance per periode

4. **Financial Reports**
   - Balance Sheet (Neraca)
   - Income Statement (Laba Rugi)
   - Cash Flow Statement

5. **Journal Templates**
   - Template untuk jurnal recurring
   - Auto-generate journal dari template

6. **Integration Points**
   - Auto-journal dari Payroll
   - Auto-journal dari SARPRAS
   - Auto-journal dari RAPBS

7. **Audit Trail**
   - Complete audit log
   - Track semua perubahan

---

## 📝 NOTES

- Entry number di-generate otomatis dengan format `JE-YYYYMMDD-0001`
- Saldo bank ter-update otomatis saat create bank transaction
- Validasi balance (debit = credit) di backend
- Soft delete tidak digunakan, karena data akuntansi tidak boleh dihapus setelah posted

---

## 🐛 TROUBLESHOOTING

### Jurnal tidak bisa di-post
- Pastikan status = draft
- Cek total debit = total credit
- Pastikan semua akun masih aktif

### Rekening tidak bisa dihapus
- Pastikan tidak ada transaksi terkait
- Cek di bank_transactions

### Akun tidak bisa dihapus
- Pastikan tidak ada sub-akun (children)
- Pastikan tidak ada transaksi di journal_details

---

**Tanggal Implementasi:** 17 Oktober 2025  
**Status:** Production Ready ✅

