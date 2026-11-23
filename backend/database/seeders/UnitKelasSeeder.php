<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\UnitKelas;
use App\Models\UnitSekolah;

class UnitKelasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get unit sekolah IDs
        $tkAnnur = UnitSekolah::where('kode', 'TK001')->first();
        $sdAnnur = UnitSekolah::where('kode', 'SD001')->first();
        $smpAnnur = UnitSekolah::where('kode', 'SMP001')->first();
        $smaAnnur = UnitSekolah::where('kode', 'SMA001')->first();

        $unitKelas = [
            // TK Classes
            [
                'kode' => 'TK-A1',
                'nama' => 'TK A1',
                'tingkat' => 1,
                'unit_sekolah_id' => $tkAnnur->id,
                'wali_kelas' => 'Bu Ani',
                'kapasitas' => 20,
                'deskripsi' => 'Kelas TK tingkat A',
                'status' => 'Aktif'
            ],
            [
                'kode' => 'TK-B1',
                'nama' => 'TK B1',
                'tingkat' => 2,
                'unit_sekolah_id' => $tkAnnur->id,
                'wali_kelas' => 'Bu Sari',
                'kapasitas' => 20,
                'deskripsi' => 'Kelas TK tingkat B',
                'status' => 'Aktif'
            ],
            // SD Classes
            [
                'kode' => 'SD1A',
                'nama' => '1A',
                'tingkat' => 1,
                'unit_sekolah_id' => $sdAnnur->id,
                'wali_kelas' => 'Bu Rina',
                'kapasitas' => 30,
                'deskripsi' => 'Kelas 1 SD',
                'status' => 'Aktif'
            ],
            [
                'kode' => 'SD2A',
                'nama' => '2A',
                'tingkat' => 2,
                'unit_sekolah_id' => $sdAnnur->id,
                'wali_kelas' => 'Bu Devi',
                'kapasitas' => 30,
                'deskripsi' => 'Kelas 2 SD',
                'status' => 'Aktif'
            ],
            [
                'kode' => 'SD3A',
                'nama' => '3A',
                'tingkat' => 3,
                'unit_sekolah_id' => $sdAnnur->id,
                'wali_kelas' => 'Bu Maya',
                'kapasitas' => 30,
                'deskripsi' => 'Kelas 3 SD',
                'status' => 'Aktif'
            ],
            // SMP Classes
            [
                'kode' => 'SMP7A',
                'nama' => '7A',
                'tingkat' => 7,
                'unit_sekolah_id' => $smpAnnur->id,
                'wali_kelas' => 'Pak Budi',
                'kapasitas' => 32,
                'deskripsi' => 'Kelas 7 SMP',
                'status' => 'Aktif'
            ],
            [
                'kode' => 'SMP8A',
                'nama' => '8A',
                'tingkat' => 8,
                'unit_sekolah_id' => $smpAnnur->id,
                'wali_kelas' => 'Bu Lisa',
                'kapasitas' => 32,
                'deskripsi' => 'Kelas 8 SMP',
                'status' => 'Aktif'
            ],
            // SMA Classes
            [
                'kode' => 'SMA10IPA',
                'nama' => '10 IPA',
                'tingkat' => 10,
                'unit_sekolah_id' => $smaAnnur->id,
                'wali_kelas' => 'Pak Andi',
                'kapasitas' => 35,
                'deskripsi' => 'Kelas 10 IPA',
                'status' => 'Aktif'
            ],
            [
                'kode' => 'SMA11IPS',
                'nama' => '11 IPS',
                'tingkat' => 11,
                'unit_sekolah_id' => $smaAnnur->id,
                'wali_kelas' => 'Bu Nina',
                'kapasitas' => 35,
                'deskripsi' => 'Kelas 11 IPS',
                'status' => 'Aktif'
            ]
        ];

        foreach ($unitKelas as $kelas) {
            UnitKelas::create($kelas);
        }
    }
}
