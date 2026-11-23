# API Integration Guide - Frontend ke Backend

## 🚀 Setup Backend

### 1. Database Configuration 
- **Database**: MySQL `annur_manajemen`
- **Connection**: Update file `.env` dengan konfigurasi MySQL Anda
- **Migration**: `php artisan migrate` (setelah database MySQL siap)

### 2. Server Development
```bash
cd backend
php artisan serve
```
Backend akan berjalan di: `http://localhost:8000`

## 📡 API Endpoints

### Authentication
```javascript
// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Logout
POST /api/auth/logout
Headers: { Authorization: "Bearer token" }

// Get Current User
GET /api/auth/user
Headers: { Authorization: "Bearer token" }
```

### User Management
```javascript
// Get Users (with filters)
GET /api/users?search=nama&status=Aktif&role=guru&per_page=15

// Create User
POST /api/users
{
  "name": "Ahmad Fauzan",
  "email": "ahmad@example.com", 
  "password": "password123",
  "nip": "123456789",
  "jabatan": "Guru",
  "unit_kerja": "Akademik",
  "status": "Aktif"
}

// Update User
PUT /api/users/{id}

// Delete User
DELETE /api/users/{id}

// Upload Avatar
POST /api/users/{id}/avatar
FormData: { avatar: File }
```

### Tata Usaha Dashboard
```javascript
// Dashboard Summary
GET /api/tu/dashboard

// Income Summary
GET /api/tu/income-summary?period=monthly

// Expense Summary  
GET /api/tu/expense-summary?period=monthly

// SPP Reminders
GET /api/tu/spp-reminders

// Approval Notifications
GET /api/tu/approval-notifications

// Attendance Status
GET /api/tu/attendance-status
```

### Cashflow Management
```javascript
// Get Income Transactions
GET /api/tu/cashflow/income?status=pending&date_from=2025-01-01

// Create Income
POST /api/tu/cashflow/income
{
  "category_id": 1,
  "title": "SPP Januari 2025",
  "description": "Pembayaran SPP siswa",
  "amount": 500000,
  "transaction_date": "2025-01-15",
  "metadata": { "student_id": 123 }
}

// Get Expense Transactions
GET /api/tu/cashflow/expense

// Create Expense
POST /api/tu/cashflow/expense

// Approve Transaction
PUT /api/tu/cashflow/transactions/{id}/approve
{ "approval_notes": "Approved by Kepala TU" }

// Reject Transaction
PUT /api/tu/cashflow/transactions/{id}/reject
{ "approval_notes": "Dokumen tidak lengkap" }

// Cashflow Summary
GET /api/tu/cashflow/summary?period=monthly
```

### Attendance Management
```javascript
// Get Attendance List
GET /api/tu/attendance?user_id=1&date_from=2025-01-01

// Check In
POST /api/tu/attendance/check-in
{
  "location": "Kantor TU",
  "notes": "Masuk normal"
}

// Check Out
POST /api/tu/attendance/check-out
{
  "notes": "Pulang normal"
}

// Attendance Report
GET /api/tu/attendance/report?period=monthly&user_id=1

// My Attendance
GET /api/tu/attendance/my-attendance?period=monthly
```

## 🔑 Authentication Headers

Semua API endpoint (kecuali login/register) memerlukan authentication header:

```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

## 📋 Response Format

Semua response API menggunakan format standar:

```javascript
// Success Response
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}

// Error Response  
{
  "success": false,
  "message": "Error message",
  "errors": { ... } // Validation errors
}
```

## 🌐 Frontend Integration

### 1. API Base URL
```javascript
const API_BASE_URL = 'http://localhost:8000/api'
```

### 2. Axios Configuration
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
})

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### 3. User Management Integration
```javascript
// services/userService.js
export const userService = {
  async getUsers(filters = {}) {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/users?${params}`)
    return response.data
  },

  async createUser(userData) {
    const response = await api.post('/users', userData)
    return response.data
  },

  async updateUser(id, userData) {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`)
    return response.data
  }
}
```

### 4. TU Dashboard Integration
```javascript
// services/tuService.js
export const tuService = {
  async getDashboard() {
    const response = await api.get('/tu/dashboard')
    return response.data
  },

  async getIncomeSummary(period = 'monthly') {
    const response = await api.get(`/tu/income-summary?period=${period}`)
    return response.data
  },

  async createTransaction(transactionData) {
    const response = await api.post('/tu/cashflow/income', transactionData)
    return response.data
  }
}
```

## 🔧 Setup MySQL Database

1. Buat database MySQL:
```sql
CREATE DATABASE annur_manajemen;
```

2. Update file `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=annur_manajemen
DB_USERNAME=root
DB_PASSWORD=your_password
```

3. Jalankan migrations:
```bash
php artisan migrate
```

## 🎯 Next Steps

1. **Setup MySQL Database** - Pastikan MySQL berjalan dan database sudah dibuat
2. **Run Backend Server** - `php artisan serve`
3. **Update Frontend API calls** - Gunakan endpoints di atas
4. **Test Integration** - Test login, user management, dan TU features
5. **Add Seeders** - Buat data dummy untuk testing

## 📝 Notes

- **CORS sudah dikonfigurasi** untuk frontend development (localhost:5173)
- **Sanctum authentication** sudah setup untuk SPA
- **File uploads** tersedia untuk avatar dan receipt files
- **Validation** otomatis di semua endpoints
- **Pagination** tersedia di list endpoints
