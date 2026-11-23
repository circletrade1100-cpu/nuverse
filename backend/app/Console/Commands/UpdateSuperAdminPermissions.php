<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Role;
use App\Models\Permission;

class UpdateSuperAdminPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'permissions:update-superadmin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update Super Admin role to include all permissions including new modules';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Updating Super Admin permissions...');

        // Find Super Admin role
        $superAdminRole = Role::where('name', 'Super Admin')
            ->orWhere('name', 'super_admin')
            ->orWhere('name', 'superadmin')
            ->first();

        if (!$superAdminRole) {
            $this->error('❌ Super Admin role not found!');
            return 1;
        }

        $this->info("✅ Found Super Admin role: {$superAdminRole->display_name}");

        // Get all permissions
        $allPermissions = Permission::where('is_active', true)->get();
        
        $this->info("📊 Total permissions available: {$allPermissions->count()}");

        // Sync all permissions to Super Admin role
        $superAdminRole->permissions()->sync($allPermissions->pluck('id')->toArray());

        $this->info('✅ Super Admin permissions updated successfully!');
        $this->info("🔑 Super Admin now has access to {$allPermissions->count()} permissions");

        // Show modules that Super Admin has access to
        $modules = $allPermissions->pluck('module')->unique()->sort()->values();
        $this->info('📋 Modules accessible to Super Admin:');
        foreach ($modules as $module) {
            $this->line("   - {$module}");
        }

        return 0;
    }
}