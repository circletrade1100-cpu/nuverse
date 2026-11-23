# Integrasi Autentikasi Backend

## Overview
Login.tsx sekarang sudah terhubung dengan backend Laravel untuk autentikasi menggunakan Laravel Sanctum.

## File yang Dibuat/Diupdate

### 1. `services/authService.ts`
Service untuk mengelola autentikasi dengan backend:
- `login()` - Login dengan username/email dan password
- `logout()` - Logout dan hapus token
- `getCurrentUser()` - Ambil data user saat ini
- `forgotPassword()` - Kirim link reset password
- `isAuthenticated()` - Cek status autentikasi

### 2. `hooks/useAuth.ts`
Custom hook untuk mengelola state autentikasi:
- State management untuk user, loading, dan status autentikasi
- Function login, logout, dan refresh user
- Auto-check authentication status saat mount

### 3. `components/ProtectedRoute.tsx`
Komponen untuk melindungi halaman yang memerlukan autentikasi:
- Redirect ke login jika tidak authenticated
- Loading state saat mengecek autentikasi

### 4. `pages/Dashboard-Guru/Login.tsx` (Updated)
- Terintegrasi dengan authService
- Loading states dan error handling
- Form "Lupa Password" dengan backend integration
- Auto-redirect jika sudah login

## API Endpoints Backend

Backend sudah menyediakan endpoint berikut:
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout (requires auth)
- `GET /api/auth/user` - Get current user (requires auth)
- `POST /api/auth/forgot-password` - Forgot password

## Cara Penggunaan

### 1. Login
```typescript
import { authService } from '../services/authService';

const response = await authService.login({
  username: 'user@example.com',
  password: 'password123'
});

if (response.success) {
  // Login berhasil, token tersimpan di localStorage
  console.log('User:', response.data.user);
  console.log('Token:', response.data.token);
}
```

### 2. Menggunakan Hook useAuth
```typescript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Silakan login terlebih dahulu</div>;
  }

  return <div>Selamat datang, {user?.name}!</div>;
};
```

### 3. Melindungi Halaman
```typescript
import ProtectedRoute from '../components/ProtectedRoute';

const App = () => (
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
);
```

## Environment Variables

Pastikan environment variables sudah diatur:
- `VITE_API_URL` untuk URL backend (opsional, default ke localhost:8001 untuk development)

## Token Management

- Token disimpan di `localStorage` dengan key `auth_token`
- Token otomatis dikirim dalam header `Authorization: Bearer <token>`
- Token dihapus saat logout atau expired

## Error Handling

Service sudah menangani berbagai error:
- Network errors
- Validation errors dari backend
- Invalid credentials
- Server errors

## Security Features

- Token-based authentication dengan Laravel Sanctum
- Auto-logout jika token invalid
- CSRF protection dari Laravel
- Secure token storage di localStorage

## Testing

Untuk test integrasi:
1. Pastikan backend Laravel sudah berjalan di port 8001
2. Buka halaman login
3. Masukkan credentials yang valid
4. Cek apakah redirect ke dashboard berhasil
5. Test logout functionality
6. Test "Lupa Password" functionality
