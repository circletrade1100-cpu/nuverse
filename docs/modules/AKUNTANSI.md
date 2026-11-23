# Modul AKUNTANSI

## 📊 Jurnal Umum

### Fitur Jurnal Umum
- **Input Jurnal**: Input transaksi jurnal
- **Jurnal Otomatis**: Jurnal otomatis dari modul lain
- **Jurnal Manual**: Jurnal manual untuk penyesuaian
- **Reversing Entries**: Jurnal pembalik

### Database Schema
```sql
CREATE TABLE journal_entries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    entry_number VARCHAR(50) UNIQUE,
    entry_date DATE,
    reference_number VARCHAR(100),
    description TEXT,
    entry_type ENUM('automatic', 'manual', 'adjustment', 'reversing'),
    source_module VARCHAR(50),
    source_id BIGINT,
    total_debit DECIMAL(15,2),
    total_credit DECIMAL(15,2),
    status ENUM('draft', 'posted', 'void'),
    posted_by BIGINT,
    posted_at TIMESTAMP,
    created_by BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE journal_details (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    journal_entry_id BIGINT,
    account_id BIGINT,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP
);
```

### API Endpoints
```php
// Journal Management
GET /api/accounting/journal-entries
POST /api/accounting/journal-entries
PUT /api/accounting/journal-entries/{id}
POST /api/accounting/journal-entries/{id}/post
POST /api/accounting/journal-entries/{id}/void

// Journal Details
GET /api/accounting/journal-entries/{id}/details
POST /api/accounting/journal-entries/{id}/details
```

## 💰 Cash & Bank

### Fitur Cash & Bank
- **Cash Management**: Manajemen kas
- **Bank Reconciliation**: Rekonsiliasi bank
- **Bank Transfers**: Transfer antar bank
- **Cash Flow**: Arus kas

### Database Schema
```sql
CREATE TABLE bank_accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_number VARCHAR(50),
    account_name VARCHAR(100),
    bank_name VARCHAR(100),
    account_type ENUM('cash', 'bank', 'investment'),
    currency VARCHAR(10) DEFAULT 'IDR',
    opening_balance DECIMAL(15,2),
    current_balance DECIMAL(15,2),
    status ENUM('active', 'inactive'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE bank_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    bank_account_id BIGINT,
    transaction_date DATE,
    transaction_type ENUM('deposit', 'withdrawal', 'transfer', 'adjustment'),
    reference_number VARCHAR(100),
    description TEXT,
    amount DECIMAL(15,2),
    balance_after DECIMAL(15,2),
    status ENUM('pending', 'completed', 'cancelled'),
    created_by BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Bank Reconciliation
```sql
CREATE TABLE bank_reconciliations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    bank_account_id BIGINT,
    reconciliation_date DATE,
    bank_statement_balance DECIMAL(15,2),
    book_balance DECIMAL(15,2),
    reconciled_balance DECIMAL(15,2),
    status ENUM('draft', 'completed'),
    created_by BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 📋 General Ledger

### Fitur General Ledger
- **Chart of Accounts**: Daftar akun
- **Account Balances**: Saldo akun
- **Trial Balance**: Neraca saldo
- **Financial Statements**: Laporan keuangan

### Chart of Accounts
```sql
CREATE TABLE chart_of_accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_code VARCHAR(20) UNIQUE,
    account_name VARCHAR(100),
    account_type ENUM('asset', 'liability', 'equity', 'revenue', 'expense'),
    parent_id BIGINT NULL,
    level INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE account_balances (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_id BIGINT,
    period_year INT,
    period_month INT,
    opening_debit DECIMAL(15,2) DEFAULT 0,
    opening_credit DECIMAL(15,2) DEFAULT 0,
    period_debit DECIMAL(15,2) DEFAULT 0,
    period_credit DECIMAL(15,2) DEFAULT 0,
    closing_debit DECIMAL(15,2) DEFAULT 0,
    closing_credit DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Trial Balance
```php
// Trial Balance API
GET /api/accounting/trial-balance
GET /api/accounting/trial-balance/{period}
GET /api/accounting/trial-balance/export
```

## 📊 Report

### Laporan Keuangan
1. **Neraca (Balance Sheet)**
2. **Laporan Laba Rugi (Income Statement)**
3. **Laporan Arus Kas (Cash Flow Statement)**
4. **Laporan Perubahan Ekuitas**

### Financial Statements API
```php
// Financial Reports
GET /api/accounting/reports/balance-sheet
GET /api/accounting/reports/income-statement
GET /api/accounting/reports/cash-flow
GET /api/accounting/reports/equity-statement

// Detailed Reports
GET /api/accounting/reports/general-ledger
GET /api/accounting/reports/account-detail
GET /api/accounting/reports/journal-detail
```

## 🔄 Integration with Other Modules

### Automatic Journal Entries
```php
// Integration Points
// TU Module
POST /api/accounting/auto-journal/tu-transaction
// Payroll Module
POST /api/accounting/auto-journal/payroll
// SARPRAS Module
POST /api/accounting/auto-journal/asset-purchase
// DANUS Module
POST /api/accounting/auto-journal/business-transaction
// RAPBS Module
POST /api/accounting/auto-journal/rapbs-realization
```

### Journal Templates
```sql
CREATE TABLE journal_templates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    template_name VARCHAR(100),
    source_module VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE journal_template_details (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    template_id BIGINT,
    account_id BIGINT,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    is_percentage BOOLEAN DEFAULT FALSE,
    percentage_field VARCHAR(50),
    created_at TIMESTAMP
);
```

## 🔐 Security & Permissions

### Role-based Access
- **Accountant**: Full access to accounting
- **Finance Manager**: View reports, approve entries
- **Auditor**: View-only access
- **System Admin**: Configuration access

### Data Security
- **Audit Trail**: Complete audit trail
- **Document Security**: Secure document storage
- **Access Control**: Role-based access
- **Data Encryption**: Encrypted sensitive data

## 📱 Frontend Components

### Accounting Components
```jsx
// Journal Management
<JournalEntryForm />
<JournalList />
<JournalDetail />
<JournalApproval />

// Cash & Bank
<BankAccountList />
<BankTransactionForm />
<BankReconciliation />
<CashFlowStatement />

// General Ledger
<ChartOfAccounts />
<AccountBalance />
<TrialBalance />
<GeneralLedger />

// Reports
<BalanceSheet />
<IncomeStatement />
<CashFlowReport />
<FinancialReports />
```

## 🎯 Key Performance Indicators (KPI)

### Accounting KPIs
- Journal entry accuracy
- Bank reconciliation rate
- Financial report timeliness
- Audit compliance rate

### Financial KPIs
- Revenue growth rate
- Expense control rate
- Cash flow efficiency
- Asset utilization rate

## 📊 Analytics & Reporting

### Standard Reports
1. **Monthly Financial Reports**
2. **Trial Balance Reports**
3. **General Ledger Reports**
4. **Bank Reconciliation Reports**

### Advanced Analytics
- Financial trend analysis
- Budget vs actual analysis
- Cash flow forecasting
- Financial ratio analysis

## 🔔 Notifications

### Notification Types
- **Journal Approval**: Notifikasi approval jurnal
- **Bank Reconciliation**: Pengingat rekonsiliasi
- **Financial Reports**: Notifikasi laporan
- **Audit Alerts**: Alert audit

### Notification Channels
- **In-app**: Notifikasi dalam aplikasi
- **Email**: Notifikasi email
- **SMS**: Notifikasi SMS
- **Push**: Notifikasi push

## 📈 Period Management

### Fiscal Year
```sql
CREATE TABLE fiscal_years (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    year_name VARCHAR(20),
    start_date DATE,
    end_date DATE,
    is_closed BOOLEAN DEFAULT FALSE,
    closed_by BIGINT,
    closed_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Period Closing
- **Monthly Closing**: Penutupan bulanan
- **Quarterly Closing**: Penutupan triwulan
- **Yearly Closing**: Penutupan tahunan
- **Adjusting Entries**: Jurnal penyesuaian

## 🔍 Audit & Compliance

### Audit Features
- **Audit Trail**: Jejak audit lengkap
- **Document Management**: Manajemen dokumen
- **Compliance Reports**: Laporan compliance
- **Internal Controls**: Kontrol internal

### Compliance Requirements
- **PSAK Compliance**: Compliance PSAK
- **Tax Compliance**: Compliance pajak
- **Government Reporting**: Laporan pemerintah
- **Internal Audit**: Audit internal
