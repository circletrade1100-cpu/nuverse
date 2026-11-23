# Nuverse

Source code aplikasi Manajemen Annur (sistem informasi sekolah).  
Isi repo: frontend React, backend Laravel, dan service WhatsApp.

```
nuverse/
├── frontend/            React + Vite + TypeScript
├── backend/             Laravel 11 (API)
├── whatsapp-service/    Node.js (blast / notifikasi WA)
├── deploy/              script deploy + contoh nginx
└── docs/
    └── database/
        ├── schema.sql           struktur tabel (bisa di-import)
        └── DATABASE_SCHEMA.md   catatan skema
```

Kebutuhan dasar:
- PHP 8.2+, Composer, MySQL/MariaDB
- Node.js 18+ dan npm
- (opsional) PM2 kalau mau jalanin WhatsApp service di background

---

## 1. Clone & siapkan database

```bash
git clone https://github.com/circletrade1100-cpu/nuverse.git
cd nuverse
```

Buat database kosong di MySQL, contoh namanya `nuverse_local`.

**Pilih salah satu cara isi struktur tabel:**

### Cara A — pakai file SQL (paling cepet buat lokal)

File: `docs/database/schema.sql` (struktur saja, tanpa data sensitif).

```bash
mysql -u root -p -e "CREATE DATABASE nuverse_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p nuverse_local < docs/database/schema.sql
```

Habis itu di backend jalankan seeder biar ada akun admin (lihat bawah).

### Cara B — lewat migrasi Laravel

```bash
cd backend
cp .env.example .env
# edit DB_* di .env sesuai database lokal kamu
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
```

Kalau sudah pakai Cara A (import `schema.sql`), **jangan** `migrate` dari nol lagi (tabelnya sudah ada). Cukup:

```bash
cd backend
cp .env.example .env
# isi DB_DATABASE, DB_USERNAME, DB_PASSWORD
composer install
php artisan key:generate
php artisan db:seed --class=SuperAdminSeeder
```

Akun awal dari seeder (ganti password setelah login):

- email: `superadmin@annur.sch.id`
- password: `superadmin123`

---

## 2. Backend (API)

```bash
cd backend
composer install          # kalau belum
cp .env.example .env      # kalau belum
php artisan key:generate  # kalau belum
php artisan serve         # default http://127.0.0.1:8000
```

Cek `.env` minimal:

```
APP_URL=http://127.0.0.1:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nuverse_local
DB_USERNAME=root
DB_PASSWORD=
```

API biasanya di path `/api/...`.

---

## 3. Frontend

```bash
cd frontend
npm install
```

Supaya request `/api` ngarah ke backend lokal (bukan production), buka `frontend/vite.config.ts`, bagian `server.proxy`:

```ts
proxy: {
  '/api': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
  }
}
```

Lalu:

```bash
npm run dev
```

Buka http://localhost:3000.

Build production:

```bash
npm run build
```

Output build (di setup server asli) masuk folder `public` lalu di-sync ke document root. Lihat script di `deploy/`.

---

## 4. WhatsApp service (opsional)

Hanya perlu kalau mau fitur blast / kirim WA.

```bash
cd whatsapp-service
cp .env.example .env
npm install
npm start
# atau: npm run pm2
```

Default port `3001`. Kalau backend butuh URL service ini, set di `.env` backend (mis. `WHATSAPP_SERVICE_URL=http://127.0.0.1:3001`).

Pertama kali jalan biasanya minta scan QR WhatsApp.

---

## 5. Pasang di server baru (ringkas)

1. Clone repo ke server (jangan taruh `.git` di folder yang bisa diakses publik kalau khawatir).
2. Buat database + user MySQL.
3. Import `docs/database/schema.sql` **atau** `php artisan migrate`.
4. Copy `backend/.env.production.template` → `backend/.env`, isi:
   - `APP_KEY` (`php artisan key:generate`)
   - DB, Midtrans, OneSignal, dll. (secret hanya di server, jangan di-commit)
5. `composer install --no-dev --optimize-autoloader`
6. `php artisan config:cache && php artisan route:cache`
7. Point nginx/Apache:
   - SPA (hasil `npm run build`) ke document root
   - `/api` ke `backend/public/index.php` (Laravel)
8. `storage` dan `bootstrap/cache` harus writable (`chmod` / ownership ke user web).
9. Frontend: `npm ci && npm run build`, copy `index.html` + `assets/` ke document root (atau pakai `deploy/deploy-frontend.sh` setelah path disesuaikan).
10. (Opsional) jalankan `whatsapp-service` dengan PM2.

Contoh config nginx ada di `deploy/nginx-production.conf` — sesuaikan domain dan path.

---

## Catatan

- File `.env` **jangan** di-commit. Yang ada di repo cuma contoh/template.
- `schema.sql` = struktur tabel biar lokal gampang nyala. Data production (siswa, pembayaran, dll.) tidak ikut; minta dump data terpisah kalau memang butuh.
- Dokumentasi modul lama ada di `docs/modules` dan beberapa file `.md` di dalam `backend/` / `frontend/`.
- Detail skema: `docs/database/DATABASE_SCHEMA.md`.
