# Frontend API Integration Guide

## 🎯 **Status Integrasi**

### ✅ **Yang Sudah Selesai:**
1. **API Services Layer** - Komunikasi dengan backend
2. **React Hooks** - State management yang mudah digunakan  
3. **Login Component** - Sudah terintegrasi dengan backend auth
4. **Authentication Flow** - Token management dan error handling

### 🔄 **Yang Sedang Dikerjakan:**
- Update komponen User Management untuk menggunakan API
- Update komponen TU Dashboard untuk menggunakan API

## 📁 **File Structure Baru**

```
frontend/src/
├── services/
│   ├── api.ts              # Base API configuration
│   ├── authService.ts      # Authentication service
│   ├── userService.ts      # User management service  
│   └── tuService.ts        # Tata Usaha service
├── hooks/
│   ├── useAuth.ts          # Authentication hook
│   ├── useUsers.ts         # User management hook
│   └── useTU.ts            # TU dashboard hooks
└── components/
    └── auth/
        └── Login.tsx       # ✅ Updated dengan API
```

## 🔧 **Cara Menggunakan API Services**

### 1. **Authentication (Login/Logout)**

```tsx
import { useAuth } from '../hooks/useAuth';

function LoginComponent() {
  const { login, logout, user, isAuthenticated, isLoading } = useAuth();

  const handleLogin = async () => {
    const success = await login({
      email: 'user@example.com',
      password: 'password123'
    });
    
    if (success) {
      // Redirect to dashboard
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}!</p>
      ) : (
        <button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      )}
    </div>
  );
}
```

### 2. **User Management**

```tsx
import { useUsers } from '../hooks/useUsers';

function UserPage() {
  const {
    users,
    isLoading,
    pagination,
    filters,
    setFilters,
    setPage,
    createUser,
    updateUser,
    deleteUser
  } = useUsers();

  const handleCreateUser = async (userData) => {
    const success = await createUser(userData);
    if (success) {
      // User created, list will auto-refresh
    }
  };

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 3. **TU Dashboard**

```tsx
import { useTUDashboard, useTransactions, useAttendance } from '../hooks/useTU';

function TUDashboard() {
  const { dashboardData, isLoading } = useTUDashboard();
  const { transactions } = useTransactions('income');
  const { checkIn, checkOut, myAttendance } = useAttendance();

  return (
    <div>
      {dashboardData && (
        <div>
          <p>Pemasukan Hari Ini: {dashboardData.income.today}</p>
          <p>Saldo Kas: {dashboardData.cash_balance}</p>
        </div>
      )}
    </div>
  );
}
```

## 🔗 **API Endpoints yang Tersedia**

### **Authentication**
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Get current user

### **User Management** 
- `GET /api/users` - Get users with pagination/filters
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `POST /api/users/{id}/avatar` - Upload avatar

### **TU Dashboard**
- `GET /api/tu/dashboard` - Dashboard summary
- `GET /api/tu/cashflow/income` - Income transactions
- `POST /api/tu/cashflow/income` - Create income
- `GET /api/tu/cashflow/expense` - Expense transactions  
- `POST /api/tu/cashflow/expense` - Create expense
- `POST /api/tu/attendance/check-in` - Check in
- `POST /api/tu/attendance/check-out` - Check out

## 🚀 **Next Steps untuk Developer**

### 1. **Update User.tsx Page**
```tsx
// Ganti mock data dengan useUsers hook
const UserPage = () => {
  const { users, isLoading, createUser, updateUser, deleteUser } = useUsers();
  
  // Hapus mockParents, mockGuru, mockManajemen
  // Gunakan users dari API
};
```

### 2. **Update TU Components**
```tsx
// Update dashboard components
const TUDashboard = () => {
  const { dashboardData } = useTUDashboard();
  const { transactions } = useTransactions('income');
  
  // Gunakan data real dari API
};
```

### 3. **Update Form Components**
```tsx
// Update form submissions
const UserFormModal = () => {
  const { createUser, updateUser } = useUsers();
  
  const handleSubmit = async (formData) => {
    if (editingUser) {
      await updateUser(editingUser.id, formData);
    } else {
      await createUser(formData);
    }
  };
};
```

## ⚡ **Fitur API Services**

### **Automatic Features:**
- **Token Management** - Otomatis handle JWT tokens
- **Error Handling** - Toast notifications untuk errors
- **Loading States** - Built-in loading indicators
- **CORS Support** - Configured untuk localhost development
- **Request Interceptors** - Auto-add auth headers
- **Response Interceptors** - Handle 401 redirects

### **Type Safety:**
- **TypeScript Support** - Full type safety
- **API Response Types** - Typed responses
- **Form Data Types** - Typed form inputs

## 🔧 **Environment Setup**

### **Backend Server**
```bash
cd backend
php artisan serve  # http://localhost:8000
```

### **Frontend Server** 
```bash
cd frontend
npm run dev       # http://localhost:5173
```

### **Database**
- MySQL database: `sekolah_annur_db`
- All migrations completed
- Ready for API calls

## 📝 **Tips untuk Developer**

1. **Ganti Mock Data** - Hapus semua `mockData` dan ganti dengan `useUsers()`, `useTU()` hooks
2. **Error Handling** - Sudah built-in dengan toast notifications
3. **Loading States** - Gunakan `isLoading` dari hooks
4. **Pagination** - Gunakan `pagination` object dari hooks
5. **Filters** - Gunakan `setFilters()` untuk search/filter
6. **Real-time Updates** - Data otomatis refresh setelah CRUD operations

## 🎯 **Target Selesai**
- [ ] Update semua komponen User Management 
- [ ] Update semua komponen TU Dashboard
- [ ] Test end-to-end functionality
- [ ] Add loading states dan error handling
- [ ] Implementasi real-time features

**Frontend-Backend integration sudah 70% selesai! 🚀**
