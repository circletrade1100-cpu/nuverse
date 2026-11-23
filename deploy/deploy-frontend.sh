#!/bin/bash
# Build Vite frontend dan salin ke document root (https://nurverse.id).
# index.html di /www/wwwroot/nurverse.id harus memuat hash bundle terbaru.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
# Document root situs (sama dengan nginx root untuk SPA)
DEST="${DEPLOY_WEB_ROOT:-/www/wwwroot/nurverse.id}"

cd "$PROJECT_ROOT/frontend"

echo "🚀 Deploying Frontend..."
echo "📦 Building (Vite → ../public)..."
npm run build

cd "$PROJECT_ROOT"

echo "📁 Syncing to document root: $DEST"
sudo mkdir -p "$DEST/assets"

# Seluruh chunk & CSS terbaru (nama file ber-hash)
sudo cp -a public/assets/. "$DEST/assets/"

sudo cp public/index.html "$DEST/index.html"

# Static root files
for f in logo-annur.png vite.svg _redirects manifest.json manifest-parent.json clear-pwa-cache.html; do
  if [[ -f "public/$f" ]]; then
    sudo cp "public/$f" "$DEST/$f"
  fi
done

echo "🔧 Permissions..."
sudo chown -R www:www "$DEST/assets" "$DEST/index.html" 2>/dev/null \
  || sudo chown -R www-data:www-data "$DEST/assets" "$DEST/index.html" 2>/dev/null \
  || true
sudo chmod -R u+rwX,go+rX "$DEST/assets" 2>/dev/null || true

echo "✅ Frontend deployment completed!"
echo "🌐 Pastikan nginx root mengarah ke: $DEST"
echo "   index.html memuat bundle dari /assets/index-*.js terbaru."
