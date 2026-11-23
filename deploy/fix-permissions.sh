#!/bin/bash

echo "🔧 Fixing permissions for Manajemen Annur..."

# Change ownership to current user for development
sudo chown -R $(whoami):$(whoami) /www/wwwroot/salam-annur.id/manajemen-annur

# Set proper permissions for files and directories
find /www/wwwroot/salam-annur.id/manajemen-annur -type f -exec chmod 644 {} \;
find /www/wwwroot/salam-annur.id/manajemen-annur -type d -exec chmod 755 {} \;

# Make scripts executable
chmod +x /www/wwwroot/salam-annur.id/manajemen-annur/*.sh

# Set special permissions for Laravel storage and cache
chmod -R 775 /www/wwwroot/salam-annur.id/manajemen-annur/backend/storage
chmod -R 775 /www/wwwroot/salam-annur.id/manajemen-annur/backend/bootstrap/cache

echo "✅ Permissions fixed! You can now edit files with VS Code."
echo "💡 Before deploying to production, run: sudo chown -R www:www /www/wwwroot/salam-annur.id/manajemen-annur"
