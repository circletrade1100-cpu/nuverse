<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::beginTransaction();

        try {
            // Create Staff Tata Usaha role if not exists
            $staffTURole = Role::firstOrCreate([
                'name' => 'staff_tata_usaha'
            ], [
                'display_name' => 'Staff Tata Usaha',
                'description' => 'Staff untuk modul Tata Usaha, Pemasukan, dan Pengeluaran',
                'is_active' => true
            ]);

            // Get specific permissions for Tata Usaha modules
            $permissionNames = [
                'tata-usaha.view', 'tata-usaha.create', 'tata-usaha.edit', 'tata-usaha.delete', 'tata-usaha.export',
                'pemasukan.view', 'pemasukan.create', 'pemasukan.edit', 'pemasukan.delete', 'pemasukan.export',
                'pengeluaran.view', 'pengeluaran.create', 'pengeluaran.edit', 'pengeluaran.delete', 'pengeluaran.export',
                'dashboard.view' // Add dashboard access
            ];

            $permissions = Permission::whereIn('name', $permissionNames)->pluck('id')->toArray();

            if (empty($permissions)) {
                $this->command->warn('No matching permissions found. Make sure to run PermissionSeeder first.');
                return;
            }

            // Assign permissions to Staff Tata Usaha role
            $staffTURole->permissions()->sync($permissions);

            // Create test user mulyono if not exists
            $testUser = User::firstOrCreate([
                'email' => 'mulyono@annur.sch.id'
            ], [
                'name' => 'Mulyono',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'is_active' => true
            ]);

            // Assign Staff Tata Usaha role to user
            $testUser->roles()->sync([$staffTURole->id]);

            // Create user profile if not exists
            if (!$testUser->profile) {
                $testUser->profile()->create([
                    'nip' => 'TU001',
                    'jabatan' => 'Staff Tata Usaha',
                    'unit_kerja' => 'Tata Usaha',
                    'status' => 'Aktif'
                ]);
            }

            DB::commit();

            $this->command->info('✅ Test user mulyono created successfully!');
            $this->command->info('📧 Email: mulyono@annur.sch.id');
            $this->command->info('🔒 Password: password123');
            $this->command->info('👤 Role: Staff Tata Usaha');
            $this->command->info('🔐 Permissions: ' . count($permissions) . ' permissions assigned');
            $this->command->info('📋 Modules: Tata Usaha, Pemasukan, Pengeluaran');

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Failed to create test user: ' . $e->getMessage());
        }
    }
}
