<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::beginTransaction();

        try {
            // Create Super Admin role if not exists
            $superAdminRole = Role::firstOrCreate([
                'name' => 'super_admin'
            ], [
                'display_name' => 'Super Admin',
                'description' => 'Super Administrator with full system access',
                'is_active' => true
            ]);

            // Create all module permissions if they don't exist
            $modules = [
                'dashboard',
                'tata-usaha',
                'pemasukan', 
                'pengeluaran',
                'payroll',
                'sarpras',
                'dana-usaha',
                'student',
                'guru',
                'divisi-unit',
                'rapbs',
                'akuntansi',
                'master-data',
                'user',
                'parent'
            ];

            $actions = ['view', 'create', 'edit', 'delete', 'export', 'import'];
            $permissions = [];

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

                    $permissions[] = $permission->id;
                }
            }

            // Assign all permissions to Super Admin role
            $superAdminRole->permissions()->sync($permissions);

            // Create Super Admin user if not exists
            $superAdminUser = User::firstOrCreate([
                'email' => 'superadmin@annur.sch.id'
            ], [
                'name' => 'Super Administrator',
                'password' => Hash::make('superadmin123'),
                'email_verified_at' => now(),
                'is_active' => true
            ]);

            // Assign Super Admin role to user
            $superAdminUser->roles()->syncWithoutDetaching([$superAdminRole->id]);

            // Create user profile if not exists
            if (!$superAdminUser->profile) {
                $superAdminUser->profile()->create([
                    'nip' => 'SUPER001',
                    'jabatan' => 'Super Administrator',
                    'unit_kerja' => 'IT Department',
                    'status' => 'Aktif'
                ]);
            }

            DB::commit();

            $this->command->info('Super Admin created successfully!');
            $this->command->info('Email: superadmin@annur.sch.id');
            $this->command->info('Password: superadmin123');
            $this->command->info('Total permissions assigned: ' . count($permissions));

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Failed to create Super Admin: ' . $e->getMessage());
        }
    }
}