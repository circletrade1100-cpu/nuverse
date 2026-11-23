<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Jabatan;

class JabatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jabatans = [
            [
                'kode' => 'JB001',
                'nama' => 'Kepala Sekolah',
                'level' => 1,
                'deskripsi' => 'Pimpinan tertinggi sekolah',
                'gaji_pokok' => 8000000,
                'tunjangan' => 2000000,
                'status' => 'Aktif'
            ],
            [
                'kode' => 'JB002',
                'nama' => 'Wakil Kepala Sekolah',
                'level' => 2,
                'deskripsi' => 'Wakil pimpinan sekolah',
                'gaji_pokok' => 7000000,
                'tunjangan' => 1500000,
                'status' => 'Aktif'
            ],
            [
                'kode' => 'JB003',
                'nama' => 'Guru Utama',
                'level' => 3,
                'deskripsi' => 'Guru senior dengan pengalaman tinggi',
                'gaji_pokok' => 6000000,
                'tunjangan' => 1200000,
                'status' => 'Aktif'
            ],
            [
                'kode' => 'JB004',
                'nama' => 'Guru Madya',
                'level' => 4,
                'deskripsi' => 'Guru dengan pengalaman menengah',
                'gaji_pokok' => 5000000,
                'tunjangan' => 1000000,
                'status' => 'Aktif'
            ],
            [
                'kode' => 'JB005',
                'nama' => 'Guru Muda',
                'level' => 5,
                'deskripsi' => 'Guru pemula atau junior',
                'gaji_pokok' => 4000000,
                'tunjangan' => 800000,
                'status' => 'Aktif'
            ],
            [
                'kode' => 'JB006',
                'nama' => 'Staff Administrasi',
                'level' => 6,
                'deskripsi' => 'Tenaga administrasi sekolah',
                'gaji_pokok' => 3500000,
                'tunjangan' => 500000,
                'status' => 'Aktif'
            ]
        ];

        foreach ($jabatans as $jabatan) {
            Jabatan::create($jabatan);
        }
    }
}
