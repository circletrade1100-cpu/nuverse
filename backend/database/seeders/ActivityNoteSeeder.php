<?php

namespace Database\Seeders;

use App\Models\ActivityNote;
use App\Models\RapbsPlan;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActivityNoteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get required data
        $user = User::first();
        if (!$user) {
            $this->command->warn('No users found. Skipping Activity Notes seeder.');
            return;
        }

        $plans = RapbsPlan::whereIn('status', ['approved', 'submitted'])->get();
        
        if ($plans->isEmpty()) {
            $this->command->warn('No RAPBS plans found. Skipping Activity Notes seeder.');
            return;
        }

        $noteCount = 0;

        foreach ($plans as $plan) {
            // Create 2-4 activity notes per plan
            $numNotes = rand(2, 4);
            
            for ($i = 1; $i <= $numNotes; $i++) {
                $noteType = $this->getNoteType($i, $plan->status);
                
                ActivityNote::create([
                    'rapbs_plan_id' => $plan->id,
                    'note_type' => $noteType,
                    'title' => $this->getNoteTitle($noteType, $plan->title),
                    'content' => $this->getNoteContent($noteType, $plan->title),
                    'created_by' => $user->id,
                    'created_at' => now()->subDays(rand(1, 45))
                ]);

                $noteCount++;
            }
        }

        $this->command->info("Activity Notes seeded successfully! ({$noteCount} notes)");
    }

    private function getNoteType($index, $planStatus)
    {
        // For approved plans, show progress and completion
        if ($planStatus === 'approved') {
            $types = ['progress', 'progress', 'completion', 'issue'];
        } else {
            // For submitted plans, show progress and issues
            $types = ['progress', 'progress', 'issue', 'progress'];
        }

        return $types[($index - 1) % count($types)];
    }

    private function getNoteTitle($type, $planTitle)
    {
        $titles = [
            'progress' => [
                'Progres Pelaksanaan Kegiatan',
                'Update Perkembangan',
                'Laporan Kemajuan',
                'Status Pelaksanaan'
            ],
            'issue' => [
                'Kendala Pelaksanaan',
                'Hambatan Teknis',
                'Permasalahan yang Dihadapi',
                'Issue Implementasi'
            ],
            'completion' => [
                'Penyelesaian Kegiatan',
                'Laporan Akhir Kegiatan',
                'Kegiatan Telah Selesai',
                'Completion Report'
            ]
        ];

        $titleArray = $titles[$type];
        return $titleArray[array_rand($titleArray)] . " - {$planTitle}";
    }

    private function getNoteContent($type, $planTitle)
    {
        $contents = [
            'progress' => [
                "Kegiatan {$planTitle} sedang dalam tahap pelaksanaan. Progres saat ini mencapai 30% dari target yang direncanakan. Proses pengadaan sudah dimulai dan vendor telah ditunjuk.",
                "Update progres kegiatan: Sudah mencapai 50% dari rencana. Tahap persiapan dan pengadaan telah selesai, saat ini memasuki tahap implementasi.",
                "Perkembangan terbaru: Kegiatan berjalan lancar sesuai jadwal. Sudah mencapai milestone pertama dengan hasil yang memuaskan. Tim pelaksana bekerja dengan baik.",
                "Status pelaksanaan: 75% selesai. Tahap akhir sedang dalam proses finalisasi. Diperkirakan akan selesai tepat waktu sesuai jadwal yang telah ditetapkan."
            ],
            'issue' => [
                "Terdapat kendala dalam pelaksanaan kegiatan terkait keterlambatan pengiriman dari vendor. Sedang dilakukan koordinasi intensif untuk mengatasi masalah ini.",
                "Hambatan teknis: Beberapa spesifikasi yang diminta tidak tersedia di pasaran lokal. Perlu penyesuaian spesifikasi atau pencarian vendor alternatif.",
                "Permasalahan administrasi: Terdapat keterlambatan dalam proses verifikasi dokumen. Sudah dilakukan koordinasi dengan bagian terkait untuk mempercepat prosesnya.",
                "Issue koordinasi antar divisi: Perlu komunikasi yang lebih intensif untuk memastikan semua pihak sejalan dengan timeline yang telah ditetapkan."
            ],
            'completion' => [
                "Kegiatan {$planTitle} telah selesai dilaksanakan dengan baik. Semua target yang direncanakan telah tercapai 100%. Dokumen serah terima sudah lengkap.",
                "Laporan penyelesaian: Kegiatan telah selesai sesuai jadwal dan anggaran yang direncanakan. Hasil evaluasi menunjukkan pencapaian yang sangat memuaskan.",
                "Kegiatan telah diselesaikan dengan sukses. Semua deliverables sudah diterima dan divalidasi. Proses penutupan kegiatan sedang dalam tahap finalisasi.",
                "Completion report: Implementasi berhasil diselesaikan dengan baik. Semua dokumen pendukung sudah lengkap dan tersimpan dengan rapi. Stakeholder memberikan feedback positif."
            ]
        ];

        $contentArray = $contents[$type];
        return $contentArray[array_rand($contentArray)];
    }
}

