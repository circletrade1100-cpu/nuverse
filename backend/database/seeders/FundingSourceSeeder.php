<?php

namespace Database\Seeders;

use App\Models\FundingSource;
use Illuminate\Database\Seeder;

class FundingSourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fundingSources = [
            [
                'name' => 'BOS Pusat',
                'type' => 'bos',
                'description' => 'Dana Bantuan Operasional Sekolah dari Pemerintah Pusat',
                'status' => 'active',
            ],
            [
                'name' => 'BOS Daerah',
                'type' => 'bos',
                'description' => 'Dana Bantuan Operasional Sekolah dari Pemerintah Daerah',
                'status' => 'active',
            ],
            [
                'name' => 'SPP Siswa',
                'type' => 'spp',
                'description' => 'Sumbangan Pembinaan Pendidikan dari orang tua siswa',
                'status' => 'active',
            ],
            [
                'name' => 'Donasi Alumni',
                'type' => 'donation',
                'description' => 'Donasi dari alumni sekolah',
                'status' => 'active',
            ],
            [
                'name' => 'Donasi Masyarakat',
                'type' => 'donation',
                'description' => 'Donasi dari masyarakat umum',
                'status' => 'active',
            ],
            [
                'name' => 'Dana Usaha Sekolah',
                'type' => 'other',
                'description' => 'Pendapatan dari unit usaha sekolah',
                'status' => 'active',
            ],
            [
                'name' => 'Dana Hibah',
                'type' => 'other',
                'description' => 'Dana hibah dari lembaga/institusi',
                'status' => 'active',
            ],
        ];

        foreach ($fundingSources as $source) {
            FundingSource::create($source);
        }
    }
}

