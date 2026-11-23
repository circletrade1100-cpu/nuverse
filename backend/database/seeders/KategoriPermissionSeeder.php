<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class KategoriPermissionSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $permissions = [
            // Kategori Pemasukan Permissions
            [
                'name' => 'kategori_pemasukan_view',
                'display_name' => 'Lihat Kategori Pemasukan',
                'description' => 'Dapat melihat daftar kategori pemasukan',
                'module' => 'kategori_pemasukan',
                'is_active' => true,
            ],
            [
                'name' => 'kategori_pemasukan_create',
                'display_name' => 'Tambah Kategori Pemasukan',
                'description' => 'Dapat menambah kategori pemasukan baru',
                'module' => 'kategori_pemasukan',
                'is_active' => true,
            ],
            [
                'name' => 'kategori_pemasukan_edit',
                'display_name' => 'Edit Kategori Pemasukan',
                'description' => 'Dapat mengedit kategori pemasukan',
                'module' => 'kategori_pemasukan',
                'is_active' => true,
            ],
            [
                'name' => 'kategori_pemasukan_delete',
                'display_name' => 'Hapus Kategori Pemasukan',
                'description' => 'Dapat menghapus kategori pemasukan',
                'module' => 'kategori_pemasukan',
                'is_active' => true,
            ],
            
            // Kategori Pengeluaran Permissions
            [
                'name' => 'kategori_pengeluaran_view',
                'display_name' => 'Lihat Kategori Pengeluaran',
                'description' => 'Dapat melihat daftar kategori pengeluaran',
                'module' => 'kategori_pengeluaran',
                'is_active' => true,
            ],
            [
                'name' => 'kategori_pengeluaran_create',
                'display_name' => 'Tambah Kategori Pengeluaran',
                'description' => 'Dapat menambah kategori pengeluaran baru',
                'module' => 'kategori_pengeluaran',
                'is_active' => true,
            ],
            [
                'name' => 'kategori_pengeluaran_edit',
                'display_name' => 'Edit Kategori Pengeluaran',
                'description' => 'Dapat mengedit kategori pengeluaran',
                'module' => 'kategori_pengeluaran',
                'is_active' => true,
            ],
            [
                'name' => 'kategori_pengeluaran_delete',
                'display_name' => 'Hapus Kategori Pengeluaran',
                'description' => 'Dapat menghapus kategori pengeluaran',
                'module' => 'kategori_pengeluaran',
                'is_active' => true,
            ],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }
    }
}
