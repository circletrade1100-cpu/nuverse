<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\UnitSekolah;

class UnitSekolahSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $unitSekolahs = [
            [
                'kode' => 'TK001',
                'nama' => 'TK Annur Pusat',
                'jenjang' => 'TK',
                'deskripsi' => 'Taman Kanak-kanak dengan fasilitas lengkap',
                'kepala_sekolah' => 'Ibu Siti Nurhaliza',
                'alamat' => 'Jl. Pendidikan No. 1',
                'telepon' => '021-12345678',
                'status' => 'Aktif'
            ],
            [
                'kode' => 'SD001',
                'nama' => 'SD Annur Pusat',
                'jenjang' => 'SD',
                'deskripsi' => 'Sekolah Dasar dengan kurikulum nasional plus',
                'kepala_sekolah' => 'Bapak Ahmad Yani',
                'alamat' => 'Jl. Pendidikan No. 2',
                'telepon' => '021-12345679',
                'status' => 'Aktif'
            ],
            [
                'kode' => 'SMP001',
                'nama' => 'SMP Annur Pusat',
                'jenjang' => 'SMP',
                'deskripsi' => 'Sekolah Menengah Pertama unggulan',
                'kepala_sekolah' => 'Ibu Fatimah Zahra',
                'alamat' => 'Jl. Pendidikan No. 3',
                'telepon' => '021-12345680',
                'status' => 'Aktif'
            ],
            [
                'kode' => 'SMA001',
                'nama' => 'SMA Annur Pusat',
                'jenjang' => 'SMA',
                'deskripsi' => 'Sekolah Menengah Atas dengan program IPA & IPS',
                'kepala_sekolah' => 'Bapak Muhammad Ridwan',
                'alamat' => 'Jl. Pendidikan No. 4',
                'telepon' => '021-12345681',
                'status' => 'Aktif'
            ]
        ];

        foreach ($unitSekolahs as $unitSekolah) {
            UnitSekolah::create($unitSekolah);
        }
    }
}
