#!/bin/bash
# Laravel backend: composer, migrate, cache

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

echo "🚀 Deploying Manajemen Annur Backend..."

composer install --optimize-autoloader --no-dev

php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

php artisan migrate --force

php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Non-root / mixed ownership: jangan gagalkan deploy jika chmod/chown ditolak
chmod -R 755 storage bootstrap/cache 2>/dev/null || true
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null \
  || chown -R www:www storage bootstrap/cache 2>/dev/null \
  || true

php artisan storage:link
php artisan queue:restart

echo "✅ Backend deployment completed!"
echo "📂 Backend: $SCRIPT_DIR/backend"
