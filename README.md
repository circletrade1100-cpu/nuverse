# Nuverse

Monorepo **Manajemen Annur** (Sistem Informasi Sekolah) — frontend, backend, dan layanan WhatsApp.

## Struktur

```
nuverse/
├── frontend/           # React 19 + Vite + TypeScript + Tailwind
├── backend/            # Laravel 11 + Sanctum (API)
├── whatsapp-service/   # Node.js + Express + wa-automate
├── deploy/             # Script deploy & contoh nginx
└── docs/               # Dokumentasi modul & database
```

## Stack

| Bagian | Teknologi |
|--------|-----------|
| Frontend | React 19, Vite 7, TypeScript, Redux Toolkit, Tailwind, DaisyUI |
| Backend | Laravel 11, PHP 8.2+, MySQL, Sanctum |
| WhatsApp | Node 18+, Express, `@open-wa/wa-automate`, PM2 |

## Setup cepat

### Backend

```bash
cd backend
cp .env.example .env   # atau .env.production.template untuk production
composer install
php artisan key:generate
php artisan migrate
php artisan serve      # atau via nginx/php-fpm
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:3000 (proxy /api → production/dev API)
npm run build          # output ke manajemen-annur/public saat di server asli
```

### WhatsApp service

```bash
cd whatsapp-service
cp .env.example .env
npm install
npm start              # atau: npm run pm2
```

## Deploy (server nurverse.id)

Script di `deploy/` menarget document root production. Sesuaikan path di `deploy-frontend.sh` sebelum dipakai di environment baru.

```bash
./deploy/deploy-frontend.sh
./deploy/deploy-backend.sh
```

## Keamanan

- Jangan commit file `.env` (credentials DB, Midtrans server key, OneSignal, dll.).
- Template production sudah di-sanitize; isi ulang secret di server saja.
- Midtrans **client** key di `frontend/index.html` memang untuk browser; **server** key tetap hanya di backend `.env`.
