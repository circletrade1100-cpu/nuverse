<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            'tata-usaha' => 'Tata Usaha',
            'pemasukan' => 'Pemasukan',
            'pengeluaran' => 'Pengeluaran',
            'payroll' => 'Payroll',
            'sarpras' => 'Sarpras',
            'dana-usaha' => 'Dana Usaha',
            'parent' => 'Parent Portal',
            'guru' => 'Guru',
            'student' => 'Student',
            'divisi-unit' => 'Divisi/Unit',
            'akuntansi' => 'Akuntansi',
            'tagihan-siswa' => 'Tagihan Siswa',
            'master-data' => 'Master Data',
            'user' => 'User Management',
            'rapbs' => 'RAPBS',
            'lpj' => 'LPJ'
        ];

        $actions = [
            'view' => 'Lihat',
            'create' => 'Tambah',
            'edit' => 'Edit',
            'delete' => 'Hapus',
            'export' => 'Export',
            'import' => 'Import'
        ];

        foreach ($modules as $moduleKey => $moduleName) {
            foreach ($actions as $actionKey => $actionName) {
                // Skip import for non-master modules
                if ($actionKey === 'import' && !in_array($moduleKey, ['master-data', 'user'])) {
                    continue;
                }

                Permission::updateOrCreate(
                    ['name' => "{$moduleKey}.{$actionKey}"],
                    [
                        'display_name' => "{$moduleName} - {$actionName}",
                        'module' => $moduleKey,
                        'is_active' => true
                    ]
                );
            }
        }

        $this->command->info('✅ Permissions seeded successfully!');
    }
}
