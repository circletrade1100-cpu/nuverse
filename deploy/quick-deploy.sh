#!/bin/bash
# Hanya frontend (build + sync). Menggunakan deploy-frontend.sh agar satu sumber kebenaran.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Quick deploy (frontend only)..."
./deploy-frontend.sh
