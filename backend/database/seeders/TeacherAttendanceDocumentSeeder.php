<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TeacherAttendanceDocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $documents = [
            [
                'teacher_id' => 9,
                'attendance_date' => '2025-10-10',
                'document_type' => 'sick_leave',
                'document_file' => 'documents/surat_sakit_001.pdf',
                'file_name' => 'Surat Sakit - Guru A.pdf',
                'file_size' => 524288, // 512 KB
                'mime_type' => 'application/pdf',
                'status' => 'approved',
                'approved_by' => 1,
                'approved_at' => now(),
                'notes' => 'Surat sakit dari dokter umum',
            ],
            [
                'teacher_id' => 23,
                'attendance_date' => '2025-10-11',
                'document_type' => 'permit',
                'document_file' => 'documents/surat_ijin_001.pdf',
                'file_name' => 'Surat Ijin - Guru B.pdf',
                'file_size' => 327680, // 320 KB
                'mime_type' => 'application/pdf',
                'status' => 'pending',
                'approved_by' => null,
                'approved_at' => null,
                'notes' => 'Ijin keperluan keluarga',
            ],
            [
                'teacher_id' => 38,
                'attendance_date' => '2025-10-09',
                'document_type' => 'sick_leave',
                'document_file' => 'documents/surat_sakit_002.pdf',
                'file_name' => 'Surat Sakit - Guru C.pdf',
                'file_size' => 450560, // 440 KB
                'mime_type' => 'application/pdf',
                'status' => 'rejected',
                'approved_by' => 1,
                'approved_at' => now(),
                'notes' => 'Surat tidak lengkap, perlu dilengkapi',
            ],
            [
                'teacher_id' => 10,
                'attendance_date' => '2025-10-08',
                'document_type' => 'other',
                'document_file' => 'documents/surat_tugas_001.pdf',
                'file_name' => 'Surat Tugas Luar.pdf',
                'file_size' => 610304, // 596 KB
                'mime_type' => 'application/pdf',
                'status' => 'approved',
                'approved_by' => 1,
                'approved_at' => now(),
                'notes' => 'Tugas dinas ke kantor cabang',
            ],
            [
                'teacher_id' => 11,
                'attendance_date' => '2025-10-12',
                'document_type' => 'permit',
                'document_file' => 'documents/surat_ijin_002.pdf',
                'file_name' => 'Surat Ijin Cuti.pdf',
                'file_size' => 389120, // 380 KB
                'mime_type' => 'application/pdf',
                'status' => 'pending',
                'approved_by' => null,
                'approved_at' => null,
                'notes' => 'Cuti melahirkan',
            ],
        ];

        foreach ($documents as $document) {
            \App\Models\TeacherAttendanceDocument::create($document);
        }
    }
}
