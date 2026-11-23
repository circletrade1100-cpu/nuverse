<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\DB;

class LPJPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::beginTransaction();

        try {
            // Get LPJ permissions
            $lpjPermissions = Permission::where('module', 'lpj')
                ->pluck('id')
                ->toArray();

            if (empty($lpjPermissions)) {
                $this->command->warn('LPJ permissions not found. Please run PermissionSeeder first.');
                return;
            }

            // Roles that should have LPJ access
            $roleNames = [
                'staff_tata_usaha',
                'kepsek_rapbs_&_divisi_unit',
                'Kepsek RAPBS & Divisi Unit',
                'kepsek_rapbs_divisi_unit',
                'Direktur Pendidikan',
                'direktur_pendidikan',
                'Direktur_Pendidikan',
                'Dirpen',
                'dirpen',
                'DIRPEN',
                'Direktur Keuangan',
                'direktur_keuangan',
                'Direktur_Keuangan',
                'DIREKTUR_KEUANGAN'
            ];

            foreach ($roleNames as $roleName) {
                $role = Role::where('name', $roleName)
                    ->orWhereRaw('LOWER(name) = ?', [strtolower($roleName)])
                    ->orWhereRaw('LOWER(name) LIKE ?', ['%' . strtolower(str_replace('_', ' ', $roleName)) . '%'])
                    ->first();

                if ($role) {
                    // Get existing permissions for this role
                    $existingPermissions = $role->permissions()->pluck('permissions.id')->toArray();
                    
                    // Merge with LPJ permissions
                    $allPermissions = array_unique(array_merge($existingPermissions, $lpjPermissions));
                    
                    // Sync permissions
                    $role->permissions()->sync($allPermissions);
                    
                    $this->command->info("✅ LPJ permissions added to role: {$role->name}");
                } else {
                    $this->command->warn("⚠️  Role not found: {$roleName}");
                }
            }

            // Also check for roles containing 'dirpen' or 'direktur keuangan'
            $rolesWithDirpen = Role::whereRaw('LOWER(name) LIKE ?', ['%dirpen%'])->get();
            foreach ($rolesWithDirpen as $role) {
                $existingPermissions = $role->permissions()->pluck('permissions.id')->toArray();
                $allPermissions = array_unique(array_merge($existingPermissions, $lpjPermissions));
                $role->permissions()->sync($allPermissions);
                $this->command->info("✅ LPJ permissions added to role: {$role->name}");
            }

            $rolesWithDirekturKeuangan = Role::whereRaw('LOWER(name) LIKE ?', ['%direktur%keuangan%'])
                ->orWhereRaw('LOWER(name) LIKE ?', ['%direktur keuangan%'])
                ->get();
            foreach ($rolesWithDirekturKeuangan as $role) {
                $existingPermissions = $role->permissions()->pluck('permissions.id')->toArray();
                $allPermissions = array_unique(array_merge($existingPermissions, $lpjPermissions));
                $role->permissions()->sync($allPermissions);
                $this->command->info("✅ LPJ permissions added to role: {$role->name}");
            }

            // Also check for roles containing 'kepsek' and 'rapbs' or 'divisi'
            $rolesWithKepsekRapbs = Role::where(function($q) {
                $q->whereRaw('LOWER(name) LIKE ?', ['%kepsek%'])
                  ->where(function($q2) {
                      $q2->whereRaw('LOWER(name) LIKE ?', ['%rapbs%'])
                        ->orWhereRaw('LOWER(name) LIKE ?', ['%divisi%']);
                  });
            })->get();
            foreach ($rolesWithKepsekRapbs as $role) {
                $existingPermissions = $role->permissions()->pluck('permissions.id')->toArray();
                $allPermissions = array_unique(array_merge($existingPermissions, $lpjPermissions));
                $role->permissions()->sync($allPermissions);
                $this->command->info("✅ LPJ permissions added to role: {$role->name}");
            }

            DB::commit();
            $this->command->info('✅ LPJ permissions seeded successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('❌ Error seeding LPJ permissions: ' . $e->getMessage());
        }
    }
}
