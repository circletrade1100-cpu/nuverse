<?php

namespace App\Console\Commands;

use App\Models\Absensi;
use Carbon\Carbon;
use Illuminate\Console\Command;

class FixUnfinishedAttendance extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:fix-unfinished {--date= : Target date (default: yesterday)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Auto-checkout untuk absensi yang belum diselesaikan';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $targetDate = $this->option('date');
        
        if ($targetDate) {
            $beforeDate = Carbon::parse($targetDate);
            $this->info("Mencari absensi yang belum checkout sebelum: {$beforeDate->format('d/m/Y')}");
        } else {
            $beforeDate = Carbon::today();
            $this->info("Mencari absensi yang belum checkout sebelum hari ini...");
        }

        // Cari semua absensi yang belum checkout
        $unfinishedAbsensi = Absensi::whereDate('tanggal', '<', $beforeDate)
            ->whereNotNull('jam_masuk')
            ->whereNull('jam_keluar')
            ->with('guru:id,nama_lengkap')
            ->get();

        if ($unfinishedAbsensi->isEmpty()) {
            $this->info('✓ Tidak ada absensi yang perlu diperbaiki');
            return 0;
        }

        $this->warn("Ditemukan {$unfinishedAbsensi->count()} absensi yang belum checkout:");
        
        // Tampilkan list
        $tableData = [];
        foreach ($unfinishedAbsensi as $absen) {
            $tableData[] = [
                'ID' => $absen->id,
                'Guru' => $absen->guru->nama_lengkap ?? 'N/A',
                'Tanggal' => $absen->tanggal->format('d/m/Y'),
                'Jam Masuk' => $absen->jam_masuk,
            ];
        }
        
        $this->table(['ID', 'Guru', 'Tanggal', 'Jam Masuk'], $tableData);

        if ($this->confirm('Auto-checkout semua absensi di atas dengan jam 16:00:00?', true)) {
            $fixed = 0;
            
            foreach ($unfinishedAbsensi as $absen) {
                try {
                    $absen->update([
                        'jam_keluar' => '16:00:00',
                        'keterangan' => ($absen->keterangan ?? '') . ' [Auto-checkout via command: ' . now()->format('d/m/Y H:i:s') . ']'
                    ]);
                    
                    $fixed++;
                    $this->info("✓ Fixed: {$absen->guru->nama_lengkap} - {$absen->tanggal->format('d/m/Y')}");
                } catch (\Exception $e) {
                    $this->error("✗ Error fixing ID {$absen->id}: {$e->getMessage()}");
                }
            }

            $this->info("\n====================================");
            $this->info("✓ Selesai! Total diperbaiki: {$fixed}/{$unfinishedAbsensi->count()}");
            $this->info("====================================\n");

            return 0;
        } else {
            $this->info('Dibatalkan oleh user');
            return 1;
        }
    }
}

