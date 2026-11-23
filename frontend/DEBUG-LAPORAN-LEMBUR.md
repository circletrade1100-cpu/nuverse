# Debug Laporan Lembur - Error "Unexpected token '<'"

## Error Explanation
Error ini terjadi karena API mengembalikan HTML (bukan JSON), kemungkinan:
1. ❌ Token authentication expired/invalid
2. ❌ Endpoint URL salah
3. ❌ User tidak punya akses ke endpoint
4. ❌ CORS issue

## 🔧 Cara Debug

### Step 1: Buka Console Browser
1. Tekan `F12` atau `Ctrl+Shift+I`
2. Pilih tab **Console**
3. Refresh halaman Laporan Lembur

### Step 2: Test Endpoint Manual
Paste kode ini di console browser:

```javascript
// Test endpoint
const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
console.log('Token:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');

fetch('https://nurverse.id/api/overtime', {
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Requested-With': 'XMLHttpRequest'
  }
})
.then(r => {
  console.log('Status:', r.status);
  console.log('Content-Type:', r.headers.get('content-type'));
  return r.text();
})
.then(text => {
  console.log('Response:', text.substring(0, 500));
  if (text.startsWith('{') || text.startsWith('[')) {
    console.log('Parsed:', JSON.parse(text));
  }
})
.catch(e => console.error('Error:', e));
```

### Step 3: Atau gunakan test function built-in

```javascript
// Import service di console
import('../../services/adminOvertimeService').then(module => {
  module.adminOvertimeService.testEndpoint();
});
```

## 📊 Expected Results

### ✅ Success Response
```
Status: 200
Content-Type: application/json
Response: {"success":true,"message":"Data lembur berhasil diambil","data":{...}}
```

### ❌ Common Errors

#### Error 401 - Unauthorized
```
Status: 401
Response: {"success":false,"message":"Unauthenticated"}
```
**Solusi**: Token expired/invalid. Login ulang.

#### Error 404 - Not Found
```
Status: 404
Response: <!DOCTYPE html>...
```
**Solusi**: Endpoint salah. Cek routing di backend.

#### Error 403 - Forbidden
```
Status: 403
Response: {"success":false,"message":"Forbidden"}
```
**Solusi**: User tidak punya akses. Cek role/permission.

## 🔑 Cek Token Authentication

```javascript
// Cek token di localStorage
console.log('auth_token:', localStorage.getItem('auth_token'));
console.log('token:', localStorage.getItem('token'));
console.log('All keys:', Object.keys(localStorage));
```

## 🌐 Cek Backend Endpoint

### Pastikan endpoint ada di backend:
File: `backend/routes/api.php`

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('overtime')->group(function () {
        Route::get('/', [OvertimeController::class, 'index']); // ✅ Harus ada
    });
});
```

### Test backend langsung dengan Postman:
```
GET https://nurverse.id/api/overtime
Headers:
  Accept: application/json
  Authorization: Bearer YOUR_TOKEN_HERE
```

## 🔧 Solusi Cepat

### Solusi 1: Login Ulang
1. Logout dari sistem
2. Login kembali
3. Token baru akan di-generate
4. Coba akses Laporan Lembur lagi

### Solusi 2: Clear Cache & Cookies
```javascript
// Clear localStorage
localStorage.clear();
// Reload
location.reload();
```

### Solusi 3: Cek User Role [[memory:9373449]]
Pastikan user yang login punya role/permission untuk akses endpoint `/api/overtime`

Backend: `OvertimeController@index` memerlukan middleware `auth:sanctum`

## 📞 Contact
Jika masih error, screenshot console log dan kirim ke developer.

