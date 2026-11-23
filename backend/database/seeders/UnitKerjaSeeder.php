<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\UnitKerja;
use App\Models\UnitSekolah;

class UnitKerjaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Unit Kerja manual (non-sekolah)
        $manualUnitKerjas = [
            [
                'kode' => 'UK001',
                'nama' => 'Kantor Pusat',
                'deskripsi' => 'Unit kerja pusat administrasi',
                'status' => 'Aktif'
            ]
        ];

        // Buat unit kerja manual terlebih dahulu
        foreach ($manualUnitKerjas as $unitKerja) {
            UnitKerja::create($unitKerja);
        }

        // Ambil data dari Unit Sekolah dan buat Unit Kerja berdasarkan itu
        $unitSekolahs = UnitSekolah::all();
        
        foreach ($unitSekolahs as $unitSekolah) {
            UnitKerja::create([
                'kode' => 'UK' . str_pad($unitSekolah->id + 1, 3, '0', STR_PAD_LEFT), // UK002, UK003, etc
                'nama' => $unitSekolah->nama,
                'deskripsi' => 'Unit kerja ' . strtolower($unitSekolah->jenjang) . ' - ' . $unitSekolah->deskripsi,
                'status' => $unitSekolah->status
            ]);
        }
    }
}
