<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ExpenseDocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $documents = [
            [
                'division_id' => 1,
                'expense_date' => '2025-10-05',
                'amount' => 5000000.00,
                'description' => 'Pembelian alat tulis kantor dan perlengkapan administrasi',
                'vendor_name' => 'PT Toko Alat Tulis Mandiri',
                'document_type' => 'receipt',
                'document_file' => 'expenses/kuitansi_atk_001.pdf',
                'file_name' => 'Kuitansi ATK Oktober.pdf',
                'file_size' => 650240,
                'mime_type' => 'application/pdf',
                'status' => 'approved',
                'approved_by' => 1,
                'approved_at' => now(),
                'notes' => 'Pembelian ATK untuk kebutuhan operasional bulan Oktober',
            ],
            [
                'division_id' => 2,
                'expense_date' => '2025-10-07',
                'amount' => 3500000.00,
                'description' => 'Biaya maintenance AC dan listrik gedung',
                'vendor_name' => 'CV Jaya Teknik',
                'document_type' => 'invoice',
                'document_file' => 'expenses/invoice_maintenance_001.pdf',
                'file_name' => 'Invoice Maintenance AC.pdf',
                'file_size' => 428032,
                'mime_type' => 'application/pdf',
                'status' => 'pending',
                'approved_by' => null,
                'approved_at' => null,
                'notes' => 'Maintenance rutin AC gedung lantai 2',
            ],
            [
                'division_id' => 1,
                'expense_date' => '2025-10-08',
                'amount' => 2750000.00,
                'description' => 'Pembelian buku dan materi pembelajaran',
                'vendor_name' => 'Toko Buku Edukatif',
                'document_type' => 'fpu',
                'document_file' => 'expenses/fpu_buku_001.pdf',
                'file_name' => 'FPU Pembelian Buku.pdf',
                'file_size' => 532480,
                'mime_type' => 'application/pdf',
                'status' => 'approved',
                'approved_by' => 1,
                'approved_at' => now(),
                'notes' => 'Buku untuk perpustakaan dan kelas',
            ],
            [
                'division_id' => 3,
                'expense_date' => '2025-10-09',
                'amount' => 4200000.00,
                'description' => 'Pembelian peralatan olahraga dan ekstrakurikuler',
                'vendor_name' => 'Toko Olahraga Sejahtera',
                'document_type' => 'receipt',
                'document_file' => 'expenses/kuitansi_olahraga_001.pdf',
                'file_name' => 'Kuitansi Peralatan Olahraga.pdf',
                'file_size' => 712704,
                'mime_type' => 'application/pdf',
                'status' => 'rejected',
                'approved_by' => 1,
                'approved_at' => now(),
                'notes' => 'Dokumen kurang lengkap, perlu dilengkapi nota pembelian',
            ],
            [
                'division_id' => 2,
                'expense_date' => '2025-10-10',
                'amount' => 6500000.00,
                'description' => 'Renovasi ruang kelas dan pengecatan',
                'vendor_name' => 'CV Bangunan Jaya',
                'document_type' => 'invoice',
                'document_file' => 'expenses/invoice_renovasi_001.pdf',
                'file_name' => 'Invoice Renovasi Kelas.pdf',
                'file_size' => 845824,
                'mime_type' => 'application/pdf',
                'status' => 'pending',
                'approved_by' => null,
                'approved_at' => null,
                'notes' => 'Renovasi ruang kelas 3A dan 3B',
            ],
        ];

        foreach ($documents as $document) {
            \App\Models\ExpenseDocument::create($document);
        }
    }
}
