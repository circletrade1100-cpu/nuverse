<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BillTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $billTypes = [
            [
                'name' => 'SPP',
                'description' => 'Sumbangan Pembinaan Pendidikan - Pembayaran bulanan untuk operasional sekolah',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Uang Pangkal',
                'description' => 'Biaya masuk sekolah - Pembayaran satu kali saat pendaftaran siswa baru',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Seragam',
                'description' => 'Biaya seragam sekolah - Baju seragam harian, olahraga, dan atribut sekolah',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kegiatan',
                'description' => 'Biaya kegiatan ekstrakurikuler dan kegiatan sekolah lainnya',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Buku Paket',
                'description' => 'Biaya buku paket dan bahan ajar untuk semester berjalan',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ujian',
                'description' => 'Biaya ujian semester dan ujian nasional',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Studi Tour',
                'description' => 'Biaya studi tour atau study trip (opsional)',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        \DB::table('bill_types')->insert($billTypes);
    }
}
