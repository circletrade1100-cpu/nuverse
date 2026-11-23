<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DivisionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $divisions = [
            [
                'name' => 'Tata Usaha',
                'code' => 'TU',
                'description' => 'Divisi Tata Usaha dan Administrasi',
                'status' => 'active',
                'head_id' => 1,
            ],
            [
                'name' => 'Kurikulum',
                'code' => 'KURIKULUM',
                'description' => 'Divisi Kurikulum dan Pembelajaran',
                'status' => 'active',
                'head_id' => 1,
            ],
            [
                'name' => 'Kesiswaan',
                'code' => 'KESISWAAN',
                'description' => 'Divisi Kesiswaan dan Kemahasiswaan',
                'status' => 'active',
                'head_id' => 1,
            ],
            [
                'name' => 'Sarana Prasarana',
                'code' => 'SARPRAS',
                'description' => 'Divisi Sarana dan Prasarana',
                'status' => 'active',
                'head_id' => 1,
            ],
            [
                'name' => 'Humas',
                'code' => 'HUMAS',
                'description' => 'Divisi Hubungan Masyarakat',
                'status' => 'active',
                'head_id' => 1,
            ],
        ];

        foreach ($divisions as $division) {
            \App\Models\Division::create($division);
        }
    }
}
