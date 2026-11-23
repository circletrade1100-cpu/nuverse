<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Absensi;
use Illuminate\Support\Facades\DB;

class FixAttendanceDates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:fix-dates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix attendance records with wrong dates in jam_masuk and jam_keluar';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to fix attendance dates...');

        // Find records where jam_masuk date doesn't match tanggal
        $records = Absensi::whereRaw('DATE(jam_masuk) != DATE(tanggal)')
            ->orWhereRaw('DATE(jam_keluar) != DATE(tanggal)')
            ->get();

        if ($records->isEmpty()) {
            $this->info('No records with wrong dates found.');
            return;
        }

        $this->info("Found {$records->count()} records with wrong dates.");

        foreach ($records as $record) {
            $tanggalAbsensi = $record->tanggal->format('Y-m-d');
            
            $this->info("Fixing record ID: {$record->id} for date: {$tanggalAbsensi}");
            
            // Fix jam_masuk
            if ($record->jam_masuk) {
                // Extract time from datetime string
                $jamMasukTime = date('H:i:s', strtotime($record->jam_masuk));
                $record->jam_masuk = $tanggalAbsensi . ' ' . $jamMasukTime;
            }
            
            // Fix jam_keluar
            if ($record->jam_keluar) {
                // Extract time from datetime string
                $jamKeluarTime = date('H:i:s', strtotime($record->jam_keluar));
                $record->jam_keluar = $tanggalAbsensi . ' ' . $jamKeluarTime;
            }
            
            $record->save();
            
            $this->info("Fixed - Masuk: {$record->jam_masuk}, Keluar: {$record->jam_keluar}");
        }

        $this->info('All records have been fixed!');
    }
}
