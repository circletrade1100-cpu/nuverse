# Modul DANA USAHA (DANUS)

## 💵 Pemasukan

### Sumber Pemasukan
1. **Catering**
   - Makan siang siswa
   - Makan siang guru
   - Catering acara sekolah
   - Catering eksternal

2. **Kolam Renang**
   - Sewa kolam renang
   - Les renang
   - Event kolam renang
   - Membership

3. **Kantin**
   - Penjualan makanan
   - Penjualan minuman
   - Snack & jajanan
   - Catering kecil

4. **Usaha Lainnya**
   - Fotokopi
   - Penjualan seragam
   - Jasa fotografi
   - Sewa aula

### Database Schema
```sql
CREATE TABLE business_units (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    type ENUM('catering', 'swimming_pool', 'canteen', 'other'),
    manager_id BIGINT,
    status ENUM('active', 'inactive'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE business_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    business_unit_id BIGINT,
    transaction_type ENUM('income', 'expense'),
    amount DECIMAL(15,2),
    description TEXT,
    transaction_date DATE,
    payment_method ENUM('cash', 'transfer', 'card'),
    reference_number VARCHAR(100),
    created_by BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 📉 Pengeluaran

### Kategori Pengeluaran
1. **Operasional**
   - Bahan baku
   - Utilitas (listrik, air, gas)
   - Transportasi
   - Maintenance peralatan

2. **Non-Operasional**
   - Gaji karyawan
   - Pajak
   - Asuransi
   - Marketing & promosi

### API Endpoints
```php
// Business Unit Management
GET /api/danus/business-units
POST /api/danus/business-units
PUT /api/danus/business-units/{id}

// Transaction Management
GET /api/danus/transactions
POST /api/danus/transactions
GET /api/danus/transactions/income
GET /api/danus/transactions/expense

// Reports
GET /api/danus/reports/summary
GET /api/danus/reports/profit-loss
GET /api/danus/reports/unit-performance
```

## 🕒 Absensi

### Catering Karyawan
- **Check-in/Check-out**: Absensi harian
- **Shift Management**: Pagi, siang, malam
- **Overtime Tracking**: Lembur
- **Performance Metrics**: Produktivitas

### Catering Siswa
- **Meal Count**: Jumlah makan per hari
- **Dietary Requirements**: Kebutuhan khusus
- **Attendance Tracking**: Kehadiran makan
- **Feedback System**: Evaluasi kualitas

### Kolam Renang
- **Member Registration**: Pendaftaran member
- **Session Tracking**: Sesi berenang
- **Instructor Schedule**: Jadwal pelatih
- **Equipment Usage**: Penggunaan peralatan

### Kantin
- **Staff Attendance**: Absensi karyawan kantin
- **Sales Tracking**: Penjualan per shift
- **Inventory Management**: Stok barang
- **Customer Service**: Layanan pelanggan

### Database Schema
```sql
CREATE TABLE business_attendance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    business_unit_id BIGINT,
    employee_id BIGINT,
    attendance_date DATE,
    check_in TIME,
    check_out TIME,
    shift_type ENUM('morning', 'afternoon', 'night'),
    overtime_hours DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE meal_attendance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT,
    meal_date DATE,
    meal_type ENUM('breakfast', 'lunch', 'dinner'),
    status ENUM('present', 'absent', 'late'),
    dietary_notes TEXT,
    created_at TIMESTAMP
);
```

## 📊 Dashboard DANUS

### Key Metrics
- **Total Revenue**: Pemasukan hari ini/bulan ini
- **Total Expenses**: Pengeluaran operasional
- **Net Profit**: Laba bersih
- **Profit Margin**: Margin keuntungan
- **Unit Performance**: Performa per unit usaha

### Real-time Monitoring
- **Live Sales**: Penjualan real-time
- **Inventory Alerts**: Stok menipis
- **Attendance Status**: Status kehadiran
- **Cash Flow**: Arus kas

## 🔄 Workflow Management

### Approval Process
1. **Staff**: Input transaksi
2. **Supervisor**: Review & approval
3. **Manager**: Final approval
4. **Finance**: Recording

### Budget Control
- **Monthly Budget**: Anggaran bulanan
- **Expense Limits**: Batas pengeluaran
- **Budget Alerts**: Notifikasi over budget
- **Budget vs Actual**: Perbandingan

## 📈 Performance Analytics

### Unit Performance
- **Revenue per Unit**: Pemasukan per unit
- **Profit per Unit**: Keuntungan per unit
- **Cost Efficiency**: Efisiensi biaya
- **Growth Rate**: Tingkat pertumbuhan

### Employee Performance
- **Attendance Rate**: Tingkat kehadiran
- **Productivity**: Produktivitas
- **Sales Performance**: Performa penjualan
- **Customer Satisfaction**: Kepuasan pelanggan

## 🔐 Security & Permissions

### Role Business Unit Manager
- View unit performance
- Manage transactions
- Approve expenses
- View reports

### Role Staff
- Input transactions
- Record attendance
- View own performance
- Submit requests

### Role Finance
- View all transactions
- Generate reports
- Manage budgets
- Audit trails

## 📱 Frontend Components

### Business Unit Components
```jsx
// Business Unit Management
<BusinessUnitList />
<BusinessUnitForm />
<BusinessUnitDetail />

// Transaction Components
<TransactionForm />
<TransactionList />
<TransactionSummary />

// Attendance Components
<AttendanceTracker />
<MealAttendance />
<PerformanceMetrics />

// Dashboard Components
<DANUSDashboard />
<RevenueChart />
<ExpenseChart />
<ProfitLossChart />
```

## 🎯 Key Performance Indicators (KPI)

### Financial KPIs
- Total revenue per month
- Net profit margin
- Cost per unit
- Return on investment

### Operational KPIs
- Customer satisfaction rate
- Employee productivity
- Inventory turnover
- Service quality score

## 📊 Reporting & Analytics

### Standard Reports
1. **Monthly Profit & Loss**
2. **Unit Performance Report**
3. **Employee Performance**
4. **Customer Satisfaction**
5. **Inventory Report**

### Advanced Analytics
- Revenue trend analysis
- Cost optimization
- Customer behavior analysis
- Predictive analytics
