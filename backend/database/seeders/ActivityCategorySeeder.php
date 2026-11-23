<?php

namespace Database\Seeders;

use App\Models\ActivityCategory;
use Illuminate\Database\Seeder;

class ActivityCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Income Categories
            [
                'name' => 'Pendapatan dari Siswa',
                'description' => 'Pendapatan yang bersumber dari siswa',
                'parent_id' => null,
                'budget_type' => 'income',
            ],
            [
                'name' => 'Pendapatan dari Pemerintah',
                'description' => 'Pendapatan yang bersumber dari pemerintah',
                'parent_id' => null,
                'budget_type' => 'income',
            ],
            [
                'name' => 'Pendapatan Lainnya',
                'description' => 'Pendapatan dari sumber lainnya',
                'parent_id' => null,
                'budget_type' => 'income',
            ],
            
            // Expense Categories
            [
                'name' => 'Belanja Pegawai',
                'description' => 'Belanja untuk gaji dan tunjangan pegawai',
                'parent_id' => null,
                'budget_type' => 'expense',
            ],
            [
                'name' => 'Belanja Operasional',
                'description' => 'Belanja untuk kegiatan operasional sekolah',
                'parent_id' => null,
                'budget_type' => 'expense',
            ],
            [
                'name' => 'Belanja Sarana Prasarana',
                'description' => 'Belanja untuk pengadaan dan pemeliharaan sarana prasarana',
                'parent_id' => null,
                'budget_type' => 'expense',
            ],
            [
                'name' => 'Belanja Kegiatan Pembelajaran',
                'description' => 'Belanja untuk mendukung kegiatan pembelajaran',
                'parent_id' => null,
                'budget_type' => 'expense',
            ],
            [
                'name' => 'Belanja Pengembangan',
                'description' => 'Belanja untuk pengembangan sekolah',
                'parent_id' => null,
                'budget_type' => 'expense',
            ],
        ];

        foreach ($categories as $category) {
            ActivityCategory::create($category);
        }

        // Create sub-categories
        $operationalCategory = ActivityCategory::where('name', 'Belanja Operasional')->first();
        if ($operationalCategory) {
            $subCategories = [
                [
                    'name' => 'ATK dan Perlengkapan Kantor',
                    'description' => 'Belanja alat tulis kantor',
                    'parent_id' => $operationalCategory->id,
                    'budget_type' => 'expense',
                ],
                [
                    'name' => 'Listrik, Air, dan Telepon',
                    'description' => 'Belanja utilitas',
                    'parent_id' => $operationalCategory->id,
                    'budget_type' => 'expense',
                ],
                [
                    'name' => 'Kebersihan dan Keamanan',
                    'description' => 'Belanja kebersihan dan keamanan',
                    'parent_id' => $operationalCategory->id,
                    'budget_type' => 'expense',
                ],
            ];

            foreach ($subCategories as $subCat) {
                ActivityCategory::create($subCat);
            }
        }
    }
}

