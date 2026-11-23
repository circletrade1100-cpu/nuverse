<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class CreateSuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:superadmin 
                            {--email=superadmin@annur.sch.id : Super admin email address}
                            {--password=superadmin123 : Super admin password}
                            {--name=Super Administrator : Super admin name}
                            {--force : Force create even if user exists}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a Super Admin user with all permissions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->option('email');
        $password = $this->option('password');
        $name = $this->option('name');
        $force = $this->option('force');

        DB::beginTransaction();

        try {
            $this->info('🚀 Creating Super Admin...');

            // Check if user already exists
            $existingUser = User::where('email', $email)->first();
            if ($existingUser && !$force) {
                $this->error("❌ User with email {$email} already exists!");
                $this->info("💡 Use --force option to update existing user");
                return 1;
            }

            // Create Super Admin role if not exists
            $superAdminRole = Role::firstOrCreate([
                'name' => 'super_admin'
            ], [
                'display_name' => 'Super Admin',
                'description' => 'Super Administrator with full system access',
                'is_active' => true
            ]);

            $this->info("✅ Super Admin role: {$superAdminRole->display_name}");

            // Create all module permissions
            $modules = [
                'dashboard', 'tata-usaha', 'pemasukan', 'pengeluaran', 'payroll',
                'sarpras', 'dana-usaha', 'student', 'guru', 'divisi-unit',
                'rapbs', 'akuntansi', 'tagihan-siswa', 'master-data', 'user', 'parent'
            ];

            $actions = ['view', 'create', 'edit', 'delete', 'export', 'import'];
            $permissions = [];
            $createdPermissions = 0;

            $progressBar = $this->output->createProgressBar(count($modules) * count($actions));
            $progressBar->start();

            foreach ($modules as $module) {
                foreach ($actions as $action) {
                    $permissionName = "{$module}.{$action}";
                    $displayName = ucwords(str_replace(['-', '.'], [' ', ' '], $permissionName));
                    
                    $permission = Permission::firstOrCreate([
                        'name' => $permissionName
                    ], [
                        'display_name' => $displayName,
                        'description' => "Permission to {$action} in {$module} module",
                        'is_active' => true
                    ]);

                    if ($permission->wasRecentlyCreated) {
                        $createdPermissions++;
                    }

                    $permissions[] = $permission->id;
                    $progressBar->advance();
                }
            }

            $progressBar->finish();
            $this->line('');
            $this->info("✅ Created {$createdPermissions} new permissions");
            $this->info("📊 Total permissions: " . count($permissions));

            // Assign all permissions to Super Admin role
            $superAdminRole->permissions()->sync($permissions);
            $this->info("✅ Assigned all permissions to Super Admin role");

            // Create or update Super Admin user
            if ($existingUser && $force) {
                $existingUser->update([
                    'name' => $name,
                    'password' => Hash::make($password),
                    'email_verified_at' => now(),
                    'is_active' => true
                ]);
                $superAdminUser = $existingUser;
                $this->info("✅ Updated existing Super Admin user");
            } else {
                $superAdminUser = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make($password),
                    'email_verified_at' => now(),
                    'is_active' => true
                ]);
                $this->info("✅ Created new Super Admin user");
            }

            // Assign Super Admin role to user
            $superAdminUser->roles()->syncWithoutDetaching([$superAdminRole->id]);
            $this->info("✅ Assigned Super Admin role to user");

            // Create user profile if not exists
            if (!$superAdminUser->profile) {
                $superAdminUser->profile()->create([
                    'nip' => 'SUPER001',
                    'jabatan' => 'Super Administrator',
                    'unit_kerja' => 'IT Department',
                    'status' => 'Aktif'
                ]);
                $this->info("✅ Created user profile");
            }

            DB::commit();

            // Display success message
            $this->line('');
            $this->info('🎉 Super Admin created successfully!');
            $this->line('');
            
            $this->table(['Field', 'Value'], [
                ['📧 Email', $email],
                ['🔑 Password', $password],
                ['👤 Name', $name],
                ['🎯 Role', 'Super Admin'],
                ['📋 NIP', 'SUPER001'],
                ['⚡ Permissions', count($permissions)]
            ]);

            $this->line('');
            $this->info('🚀 You can now login with these credentials!');
            $this->warn('⚠️  Please change the default password after first login for security.');

            return 0;

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('❌ Failed to create Super Admin: ' . $e->getMessage());
            $this->line('');
            $this->error('Stack trace:');
            $this->line($e->getTraceAsString());
            return 1;
        }
    }
}