<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Absensi;
use Illuminate\Support\Facades\DB;

class CleanDuplicateAttendance extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:clean-duplicates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean duplicate attendance records for the same guru and date';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to clean duplicate attendance records...');

        // Find duplicate records
        $duplicates = DB::table('absensi')
            ->select('id_guru', 'tanggal', DB::raw('COUNT(*) as count'))
            ->groupBy('id_guru', 'tanggal')
            ->having('count', '>', 1)
            ->get();

        if ($duplicates->isEmpty()) {
            $this->info('No duplicate records found.');
            return;
        }

        $this->info("Found {$duplicates->count()} duplicate groups.");

        foreach ($duplicates as $duplicate) {
            $this->info("Processing duplicates for guru {$duplicate->id_guru} on {$duplicate->tanggal}...");

            // Get all records for this guru and date
            $records = Absensi::where('id_guru', $duplicate->id_guru)
                ->whereDate('tanggal', $duplicate->tanggal)
                ->orderBy('created_at', 'desc')
                ->get();

            // Keep the most complete record (has both jam_masuk and jam_keluar)
            $completeRecord = $records->first(function ($record) {
                return $record->jam_masuk && $record->jam_keluar;
            });

            if ($completeRecord) {
                $this->info("Found complete record: ID {$completeRecord->id}");
                // Delete all other records
                $records->where('id', '!=', $completeRecord->id)->each(function ($record) {
                    $this->info("Deleting incomplete record: ID {$record->id}");
                    $record->delete();
                });
            } else {
                // If no complete record, keep the latest one
                $latestRecord = $records->first();
                $this->info("No complete record found, keeping latest: ID {$latestRecord->id}");
                // Delete all other records
                $records->where('id', '!=', $latestRecord->id)->each(function ($record) {
                    $this->info("Deleting older record: ID {$record->id}");
                    $record->delete();
                });
            }
        }

        $this->info('Duplicate cleaning completed!');
    }
}