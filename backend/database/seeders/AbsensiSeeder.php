<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Absensi;
use Carbon\Carbon;

class AbsensiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Generate absensi untuk guru_id 111
     * Periode: 26 September - 25 Oktober 2025
     * 6 hari per minggu (Senin-Sabtu)
     */
    public function run(): void
    {
        $guruId = 111;
        $startDate = Carbon::create(2025, 9, 26); // 26 September 2025
        $endDate = Carbon::create(2025, 10, 25);  // 25 Oktober 2025
        
        $currentDate = $startDate->copy();
        
        $absensiData = [];
        
        while ($currentDate->lte($endDate)) {
            // Skip Minggu saja (0), masuk Senin-Sabtu (6 hari/minggu)
            if ($currentDate->dayOfWeek !== 0) {
                
                // Random status: 90% hadir, 5% izin, 3% sakit, 2% alpha
                $random = rand(1, 100);
                if ($random <= 90) {
                    $status = 'hadir';
                } elseif ($random <= 95) {
                    $status = 'izin';
                } elseif ($random <= 98) {
                    $status = 'sakit';
                } else {
                    $status = 'alpha';
                }
                
                // Jam masuk random antara 07:00 - 07:30
                $jamMasukHour = 7;
                $jamMasukMinute = rand(0, 30);
                $jamMasuk = sprintf('%02d:%02d:00', $jamMasukHour, $jamMasukMinute);
                
                // Jam keluar random antara 15:00 - 16:00 (untuk yang hadir)
                $jamKeluarHour = rand(15, 16);
                $jamKeluarMinute = rand(0, 59);
                $jamKeluar = $status === 'hadir' ? sprintf('%02d:%02d:00', $jamKeluarHour, $jamKeluarMinute) : null;
                
                // Jam mengajar random 4-8 jam (untuk yang hadir)
                $jamMengajar = $status === 'hadir' ? rand(4, 8) : 0;
                
                // Keterangan berdasarkan status
                $keterangan = null;
                switch ($status) {
                    case 'izin':
                        $keteranganOptions = ['Keperluan keluarga', 'Urusan pribadi', 'Acara keluarga'];
                        $keterangan = $keteranganOptions[array_rand($keteranganOptions)];
                        break;
                    case 'sakit':
                        $keteranganOptions = ['Demam', 'Flu', 'Sakit kepala', 'Tidak enak badan'];
                        $keterangan = $keteranganOptions[array_rand($keteranganOptions)];
                        break;
                    case 'alpha':
                        $keterangan = 'Tidak ada keterangan';
                        break;
                }
                
                // Lokasi
                $lokasiOptions = ['Sekolah', 'TK An-Nur', 'SMP An-Nur', 'SMA An-Nur', 'Kantor Yayasan'];
                $lokasi = $lokasiOptions[array_rand($lokasiOptions)];
                
                $absensiData[] = [
                    'id_guru' => $guruId,
                    'tanggal' => $currentDate->format('Y-m-d'),
                    'jam_masuk' => $status !== 'alpha' ? $jamMasuk : null,
                    'jam_keluar' => $jamKeluar,
                    'status' => $status,
                    'keterangan' => $keterangan,
                    'jam_mengajar' => $jamMengajar,
                    'lokasi' => $status !== 'alpha' ? $lokasi : null,
                    'foto' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            $currentDate->addDay();
        }
        
        // Hapus data absensi lama untuk guru ini di periode yang sama
        Absensi::where('id_guru', $guruId)
            ->whereBetween('tanggal', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->delete();
        
        $this->command->info("✓ Data lama untuk periode ini telah dihapus");
        
        // Insert data baru ke database
        Absensi::insert($absensiData);
        
        $totalData = count($absensiData);
        $this->command->info("✓ Berhasil membuat {$totalData} data absensi untuk guru ID {$guruId}");
        $this->command->info("  Periode: 26 September - 25 Oktober 2025");
        $this->command->info("  Total hari kerja: {$totalData} hari");
    }
}

