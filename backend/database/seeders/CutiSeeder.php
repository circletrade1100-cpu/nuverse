<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Cuti;
use App\Models\Guru;
use App\Models\User;
use Carbon\Carbon;

class CutiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil beberapa guru untuk data mock
        $gurus = Guru::limit(5)->get();
        
        if ($gurus->isEmpty()) {
            $this->command->warn('Tidak ada data guru. Jalankan GuruSeeder terlebih dahulu.');
            return;
        }

        // Ambil user pertama sebagai approver
        $approver = User::first();
        
        if (!$approver) {
            $this->command->warn('Tidak ada data user. Jalankan SuperAdminSeeder terlebih dahulu.');
            return;
        }

        $jenisCuti = [
            'Cuti Tahunan',
            'Cuti Sakit',
            'Cuti Melahirkan',
            'Cuti Besar',
            'Cuti Alasan Penting',
            'Izin Tidak Masuk'
        ];

        $namaGuru = [
            'Ahmad Wijaya, S.Pd',
            'Siti Nurhaliza, S.Pd',
            'Budi Santoso, S.Pd',
            'Rina Marlina, S.Pd',
            'Dedi Kurniawan, S.Pd'
        ];

        $datasCuti = [];

        // Cuti Approved (bulan lalu)
        foreach ($gurus->take(3) as $index => $guru) {
            $tanggalMulai = Carbon::now()->subMonth()->addDays($index * 5);
            $tanggalSelesai = $tanggalMulai->copy()->addDays(2);
            
            $datasCuti[] = [
                'id_guru' => $guru->id,
                'jenis' => $jenisCuti[0], // Cuti Tahunan
                'tanggal_mulai' => $tanggalMulai->format('Y-m-d'),
                'tanggal_selesai' => $tanggalSelesai->format('Y-m-d'),
                'durasi' => 3,
                'status' => 'approved',
                'alasan' => 'Liburan keluarga dan refreshing setelah bekerja keras',
                'tanggal_disetujui' => $tanggalMulai->copy()->subDays(5)->format('Y-m-d'),
                'pengganti' => $namaGuru[$index],
                'disetujui_oleh' => $approver->id,
                'created_by' => $guru->id,
                'created_at' => $tanggalMulai->copy()->subDays(7),
                'updated_at' => $tanggalMulai->copy()->subDays(5)
            ];
        }

        // Cuti Sakit Approved (minggu lalu)
        if ($gurus->count() >= 2) {
            $guru = $gurus[1];
            $tanggalMulai = Carbon::now()->subWeek();
            $tanggalSelesai = $tanggalMulai->copy()->addDays(1);
            
            $datasCuti[] = [
                'id_guru' => $guru->id,
                'jenis' => $jenisCuti[1], // Cuti Sakit
                'tanggal_mulai' => $tanggalMulai->format('Y-m-d'),
                'tanggal_selesai' => $tanggalSelesai->format('Y-m-d'),
                'durasi' => 2,
                'status' => 'approved',
                'alasan' => 'Sakit demam dan flu, perlu istirahat di rumah',
                'tanggal_disetujui' => $tanggalMulai->copy()->subDay()->format('Y-m-d'),
                'pengganti' => $namaGuru[0],
                'disetujui_oleh' => $approver->id,
                'created_by' => $guru->id,
                'created_at' => $tanggalMulai->copy()->subDays(2),
                'updated_at' => $tanggalMulai->copy()->subDay()
            ];
        }

        // Cuti Pending (akan datang)
        foreach ($gurus->take(2) as $index => $guru) {
            $tanggalMulai = Carbon::now()->addWeeks($index + 1);
            $tanggalSelesai = $tanggalMulai->copy()->addDays(2);
            
            $datasCuti[] = [
                'id_guru' => $guru->id,
                'jenis' => $jenisCuti[$index + 2],
                'tanggal_mulai' => $tanggalMulai->format('Y-m-d'),
                'tanggal_selesai' => $tanggalSelesai->format('Y-m-d'),
                'durasi' => 3,
                'status' => 'pending',
                'alasan' => 'Keperluan keluarga yang mendesak, perlu menemani keluarga',
                'tanggal_disetujui' => null,
                'pengganti' => null,
                'disetujui_oleh' => null,
                'created_by' => $guru->id,
                'created_at' => Carbon::now()->subDays($index + 1),
                'updated_at' => Carbon::now()->subDays($index + 1)
            ];
        }

        // Cuti Rejected
        if ($gurus->count() >= 3) {
            $guru = $gurus[2];
            $tanggalMulai = Carbon::now()->addDays(5);
            $tanggalSelesai = $tanggalMulai->copy()->addDays(4);
            
            $datasCuti[] = [
                'id_guru' => $guru->id,
                'jenis' => $jenisCuti[0], // Cuti Tahunan
                'tanggal_mulai' => $tanggalMulai->format('Y-m-d'),
                'tanggal_selesai' => $tanggalSelesai->format('Y-m-d'),
                'durasi' => 5,
                'status' => 'rejected',
                'alasan' => 'Ingin berlibur ke luar kota bersama keluarga',
                'tanggal_disetujui' => Carbon::now()->subDay()->format('Y-m-d'),
                'pengganti' => null,
                'disetujui_oleh' => $approver->id,
                'created_by' => $guru->id,
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDay()
            ];
        }

        // Cuti Melahirkan Approved (bulan ini)
        if ($gurus->count() >= 4) {
            $guru = $gurus[3];
            $tanggalMulai = Carbon::now()->subDays(10);
            $tanggalSelesai = $tanggalMulai->copy()->addDays(89); // 90 hari
            
            $datasCuti[] = [
                'id_guru' => $guru->id,
                'jenis' => $jenisCuti[2], // Cuti Melahirkan
                'tanggal_mulai' => $tanggalMulai->format('Y-m-d'),
                'tanggal_selesai' => $tanggalSelesai->format('Y-m-d'),
                'durasi' => 90,
                'status' => 'approved',
                'alasan' => 'Cuti melahirkan anak pertama',
                'tanggal_disetujui' => $tanggalMulai->copy()->subDays(15)->format('Y-m-d'),
                'pengganti' => $namaGuru[4],
                'disetujui_oleh' => $approver->id,
                'created_by' => $guru->id,
                'created_at' => $tanggalMulai->copy()->subDays(20),
                'updated_at' => $tanggalMulai->copy()->subDays(15)
            ];
        }

        // Cuti Besar Approved (tahun ini)
        if ($gurus->count() >= 5) {
            $guru = $gurus[4];
            $tanggalMulai = Carbon::now()->subMonths(2);
            $tanggalSelesai = $tanggalMulai->copy()->addDays(6);
            
            $datasCuti[] = [
                'id_guru' => $guru->id,
                'jenis' => $jenisCuti[3], // Cuti Besar
                'tanggal_mulai' => $tanggalMulai->format('Y-m-d'),
                'tanggal_selesai' => $tanggalSelesai->format('Y-m-d'),
                'durasi' => 7,
                'status' => 'approved',
                'alasan' => 'Telah bekerja selama 6 tahun tanpa cuti besar, ingin berlibur dengan keluarga',
                'tanggal_disetujui' => $tanggalMulai->copy()->subDays(10)->format('Y-m-d'),
                'pengganti' => $namaGuru[0],
                'disetujui_oleh' => $approver->id,
                'created_by' => $guru->id,
                'created_at' => $tanggalMulai->copy()->subDays(15),
                'updated_at' => $tanggalMulai->copy()->subDays(10)
            ];
        }

        // Izin Tidak Masuk Pending (besok)
        if ($gurus->count() >= 1) {
            $guru = $gurus[0];
            $tanggalMulai = Carbon::tomorrow();
            $tanggalSelesai = $tanggalMulai->copy();
            
            $datasCuti[] = [
                'id_guru' => $guru->id,
                'jenis' => $jenisCuti[5], // Izin Tidak Masuk
                'tanggal_mulai' => $tanggalMulai->format('Y-m-d'),
                'tanggal_selesai' => $tanggalSelesai->format('Y-m-d'),
                'durasi' => 1,
                'status' => 'pending',
                'alasan' => 'Ada keperluan mendadak di keluarga',
                'tanggal_disetujui' => null,
                'pengganti' => $namaGuru[1],
                'disetujui_oleh' => null,
                'created_by' => $guru->id,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ];
        }

        // Multiple Cuti Approved untuk statistik
        if ($gurus->count() >= 2) {
            $guru = $gurus[1];
            
            // Cuti 1
            $tanggalMulai = Carbon::now()->subMonths(3);
            $tanggalSelesai = $tanggalMulai->copy()->addDays(2);
            
            $datasCuti[] = [
                'id_guru' => $guru->id,
                'jenis' => $jenisCuti[0],
                'tanggal_mulai' => $tanggalMulai->format('Y-m-d'),
                'tanggal_selesai' => $tanggalSelesai->format('Y-m-d'),
                'durasi' => 3,
                'status' => 'approved',
                'alasan' => 'Mudik lebaran ke kampung halaman',
                'tanggal_disetujui' => $tanggalMulai->copy()->subDays(7)->format('Y-m-d'),
                'pengganti' => $namaGuru[2],
                'disetujui_oleh' => $approver->id,
                'created_by' => $guru->id,
                'created_at' => $tanggalMulai->copy()->subDays(10),
                'updated_at' => $tanggalMulai->copy()->subDays(7)
            ];

            // Cuti 2
            $tanggalMulai = Carbon::now()->subMonths(4);
            $tanggalSelesai = $tanggalMulai->copy()->addDays(1);
            
            $datasCuti[] = [
                'id_guru' => $guru->id,
                'jenis' => $jenisCuti[1],
                'tanggal_mulai' => $tanggalMulai->format('Y-m-d'),
                'tanggal_selesai' => $tanggalSelesai->format('Y-m-d'),
                'durasi' => 2,
                'status' => 'approved',
                'alasan' => 'Sakit dan perlu istirahat',
                'tanggal_disetujui' => $tanggalMulai->copy()->subDay()->format('Y-m-d'),
                'pengganti' => $namaGuru[0],
                'disetujui_oleh' => $approver->id,
                'created_by' => $guru->id,
                'created_at' => $tanggalMulai->copy()->subDays(2),
                'updated_at' => $tanggalMulai->copy()->subDay()
            ];
        }

        // Insert semua data
        foreach ($datasCuti as $data) {
            Cuti::create($data);
        }

        $this->command->info('Data cuti berhasil di-seed: ' . count($datasCuti) . ' record');
    }
}

