#!/bin/bash
# Full deployment: backend (Laravel) + frontend (Vite → document root nurverse.id)
# Jalankan dari mana pun: ./deploy.sh atau bash deploy.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting full deployment of Manajemen Annur..."
echo "📂 Project: $SCRIPT_DIR"
echo ""

echo "📦 Backend deployment..."
./deploy-backend.sh

echo ""
echo "📦 Frontend build + sync ke document root..."
./deploy-frontend.sh

echo ""
echo "🔄 Restarting services..."
sudo systemctl restart nginx 2>/dev/null || echo "⚠️  Could not restart nginx - please restart manually"
# Urutan: aaPanel/BT (php-fpm-83), Ubuntu packages (php8.3-fpm, php8.2-fpm), generic php-fpm
if ! sudo systemctl restart php-fpm-83 2>/dev/null \
  && ! sudo systemctl restart php8.3-fpm 2>/dev/null \
  && ! sudo systemctl restart php8.2-fpm 2>/dev/null \
  && ! sudo systemctl restart php-fpm 2>/dev/null; then
  echo "⚠️  Could not restart PHP-FPM - cek: systemctl list-units | grep -i php"
fi

echo ""
echo "✅ Full deployment completed!"
echo "🌐 Application: https://nurverse.id"
