<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Guru;

class GuruSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil ID dari tabel jabatans dan unit_sekolahs
        $jabatanGuruUtama = \App\Models\Jabatan::where('nama', 'Guru Utama')->first();
        $jabatanGuruMuda = \App\Models\Jabatan::where('nama', 'Guru Muda')->first();
        $jabatanGuruMadya = \App\Models\Jabatan::where('nama', 'Guru Madya')->first();
        $unitSekolah = \App\Models\UnitSekolah::first(); // Ambil unit sekolah pertama

        $gurus = [
            [
                'nama_lengkap' => 'Dr. Ahmad Wijaya, S.Pd., M.Pd.',
                'nip' => '196505151990031001',
                'jabatan_id' => $jabatanGuruUtama ? $jabatanGuruUtama->id : 1,
                'status' => 'Aktif',
                'tmt' => '1990-03-01',
                'unit_sekolah_id' => $unitSekolah ? $unitSekolah->id : 1,
                'tempat_lahir' => 'Jakarta',
                'tanggal_lahir' => '1965-05-15',
                'jenjang_pendidikan' => 'S3',
                'jurusan' => 'Pendidikan Matematika',
                'status_pernikahan' => 'Menikah',
                'tugas_tambahan' => 'Kepala Sekolah',
                'mapel_diampu' => ['Matematika'],
                'jam_mengajar' => 12,
                'email' => 'ahmad.wijaya@ypiannur.sch.id',
                'no_telepon' => '+62 812-1111-1111',
                'alamat' => 'Jl. Sudirman No. 123, Jakarta Pusat',
                'username' => 'ahmad.wijaya',
                'password' => 'password123'
            ],
            [
                'nama_lengkap' => 'Siti Nurhaliza, S.Pd.',
                'nip' => '198803121010012001',
                'jabatan_id' => $jabatanGuruMuda ? $jabatanGuruMuda->id : 2,
                'status' => 'Aktif',
                'tmt' => '2010-01-02',
                'unit_sekolah_id' => $unitSekolah ? $unitSekolah->id : 1,
                'tempat_lahir' => 'Bandung',
                'tanggal_lahir' => '1988-03-12',
                'jenjang_pendidikan' => 'S1',
                'jurusan' => 'Pendidikan Bahasa Indonesia',
                'status_pernikahan' => 'Menikah',
                'tugas_tambahan' => 'Wakil Kepala Sekolah Bidang Kurikulum',
                'mapel_diampu' => ['Bahasa Indonesia'],
                'jam_mengajar' => 24,
                'email' => 'siti.nurhaliza@ypiannur.sch.id',
                'no_telepon' => '+62 812-2222-2222',
                'alamat' => 'Jl. Gatot Subroto No. 45, Jakarta Selatan',
                'username' => 'siti.nurhaliza',
                'password' => 'password123'
            ],
            [
                'nama_lengkap' => 'Budi Santoso, S.Si., M.Pd.',
                'nip' => '198201051005011002',
                'jabatan_id' => $jabatanGuruMadya ? $jabatanGuruMadya->id : 3,
                'status' => 'Aktif',
                'tmt' => '2005-01-01',
                'unit_sekolah_id' => $unitSekolah ? $unitSekolah->id : 1,
                'tempat_lahir' => 'Surabaya',
                'tanggal_lahir' => '1982-01-05',
                'jenjang_pendidikan' => 'S2',
                'jurusan' => 'Pendidikan IPA',
                'status_pernikahan' => 'Menikah',
                'tugas_tambahan' => 'Koordinator IPA',
                'mapel_diampu' => ['IPA', 'Fisika'],
                'jam_mengajar' => 28,
                'email' => 'budi.santoso@ypiannur.sch.id',
                'no_telepon' => '+62 812-3333-3333',
                'alamat' => 'Jl. Thamrin No. 67, Jakarta Pusat',
                'username' => 'budi.santoso',
                'password' => 'password123'
            ],
            [
                'nama_lengkap' => 'Rini Susanti, S.Pd.',
                'nip' => '199205201510012003',
                'jabatan_id' => $jabatanGuruMuda ? $jabatanGuruMuda->id : 2,
                'status' => 'Aktif',
                'tmt' => '2015-10-01',
                'unit_sekolah_id' => $unitSekolah ? $unitSekolah->id : 1,
                'tempat_lahir' => 'Yogyakarta',
                'tanggal_lahir' => '1992-05-20',
                'jenjang_pendidikan' => 'S1',
                'jurusan' => 'Pendidikan Bahasa Inggris',
                'status_pernikahan' => 'Belum Menikah',
                'mapel_diampu' => ['Bahasa Inggris'],
                'jam_mengajar' => 20,
                'email' => 'rini.susanti@ypiannur.sch.id',
                'no_telepon' => '+62 812-4444-4444',
                'alamat' => 'Jl. Kuningan No. 89, Jakarta Selatan',
                'username' => 'rini.susanti',
                'password' => 'password123'
            ],
            [
                'nama_lengkap' => 'Maya Sari, S.Pd., M.Sn.',
                'nip' => '199001151012012004',
                'jabatan_id' => $jabatanGuruMuda ? $jabatanGuruMuda->id : 2,
                'status' => 'Aktif',
                'tmt' => '2012-01-02',
                'unit_sekolah_id' => $unitSekolah ? $unitSekolah->id : 1,
                'tempat_lahir' => 'Medan',
                'tanggal_lahir' => '1990-01-15',
                'jenjang_pendidikan' => 'S2',
                'jurusan' => 'Pendidikan Seni Budaya',
                'status_pernikahan' => 'Menikah',
                'mapel_diampu' => ['Seni Budaya'],
                'jam_mengajar' => 18,
                'email' => 'maya.sari@ypiannur.sch.id',
                'no_telepon' => '+62 812-5555-5555',
                'alamat' => 'Jl. Kemang Raya No. 12, Jakarta Selatan',
                'username' => 'maya.sari',
                'password' => 'password123'
            ]
        ];

        foreach ($gurus as $guru) {
            Guru::create($guru);
        }
    }
}
