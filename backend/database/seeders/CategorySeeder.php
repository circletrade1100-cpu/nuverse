<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Income Categories (Pemasukan)
            [
                'name' => 'SPP Siswa',
                'code' => 'SPP',
                'type' => 'income',
                'description' => 'Pembayaran SPP bulanan siswa',
                'icon' => 'graduation-cap',
                'color' => '#10B981'
            ],
            [
                'name' => 'Ekstrakurikuler',
                'code' => 'ESKUL',
                'type' => 'income',
                'description' => 'Biaya kegiatan ekstrakurikuler',
                'icon' => 'play',
                'color' => '#3B82F6'
            ],
            [
                'name' => 'Penjualan Buku',
                'code' => 'BUKU',
                'type' => 'income',
                'description' => 'Penjualan buku pelajaran dan alat tulis',
                'icon' => 'book-open',
                'color' => '#8B5CF6'
            ],
            [
                'name' => 'Biaya Kegiatan',
                'code' => 'KEGIATAN',
                'type' => 'income',
                'description' => 'Biaya kegiatan sekolah dan acara khusus',
                'icon' => 'calendar',
                'color' => '#F59E0B'
            ],
            [
                'name' => 'Anggaran Jasa Pengguna (AJP)',
                'code' => 'AJP',
                'type' => 'income',
                'description' => 'Anggaran jasa pengguna dari pemerintah',
                'icon' => 'banknotes',
                'color' => '#EF4444'
            ],
            [
                'name' => 'Penjualan Seragam',
                'code' => 'SERAGAM',
                'type' => 'income',
                'description' => 'Penjualan seragam sekolah',
                'icon' => 'user',
                'color' => '#06B6D4'
            ],
            [
                'name' => 'Infaq dan Sumbangan',
                'code' => 'INFAQ',
                'type' => 'income',
                'description' => 'Infaq dan sumbangan dari donatur',
                'icon' => 'heart',
                'color' => '#84CC16'
            ],
            [
                'name' => 'Transaksi Koperasi',
                'code' => 'KOPERASI',
                'type' => 'income',
                'description' => 'Pendapatan dari koperasi sekolah',
                'icon' => 'building-storefront',
                'color' => '#F97316'
            ],
            [
                'name' => 'Pendaftaran Siswa Baru',
                'code' => 'PSB',
                'type' => 'income',
                'description' => 'Biaya pendaftaran siswa baru',
                'icon' => 'user-plus',
                'color' => '#EC4899'
            ],
            
            // Expense Categories (Pengeluaran)
            [
                'name' => 'Gaji Karyawan',
                'code' => 'GAJI',
                'type' => 'expense',
                'description' => 'Pembayaran gaji guru dan staff',
                'icon' => 'users',
                'color' => '#DC2626'
            ],
            [
                'name' => 'Operasional Sekolah',
                'code' => 'OPERASIONAL',
                'type' => 'expense',
                'description' => 'Biaya operasional harian sekolah',
                'icon' => 'cog',
                'color' => '#7C2D12'
            ],
            [
                'name' => 'Alat Tulis Kantor',
                'code' => 'ATK',
                'type' => 'expense',
                'description' => 'Pembelian alat tulis dan perlengkapan kantor',
                'icon' => 'pencil',
                'color' => '#92400E'
            ],
            [
                'name' => 'Listrik dan Air',
                'code' => 'UTILITIES',
                'type' => 'expense',
                'description' => 'Pembayaran listrik, air, dan utilitas',
                'icon' => 'bolt',
                'color' => '#B91C1C'
            ],
            [
                'name' => 'Pemeliharaan Gedung',
                'code' => 'MAINTENANCE',
                'type' => 'expense',
                'description' => 'Biaya pemeliharaan dan perbaikan gedung',
                'icon' => 'wrench-screwdriver',
                'color' => '#991B1B'
            ],
            [
                'name' => 'Transportasi',
                'code' => 'TRANSPORT',
                'type' => 'expense',
                'description' => 'Biaya transportasi dan perjalanan dinas',
                'icon' => 'truck',
                'color' => '#7F1D1D'
            ],
            [
                'name' => 'Konsumsi dan Rapat',
                'code' => 'KONSUMSI',
                'type' => 'expense',
                'description' => 'Biaya konsumsi rapat dan acara',
                'icon' => 'cake',
                'color' => '#450A0A'
            ],
            [
                'name' => 'Peralatan Pembelajaran',
                'code' => 'PERALATAN',
                'type' => 'expense',
                'description' => 'Pembelian peralatan dan media pembelajaran',
                'icon' => 'academic-cap',
                'color' => '#1F2937'
            ],
            [
                'name' => 'Keamanan dan Kebersihan',
                'code' => 'SECURITY',
                'type' => 'expense',
                'description' => 'Biaya keamanan dan kebersihan sekolah',
                'icon' => 'shield-check',
                'color' => '#374151'
            ],
            [
                'name' => 'Internet dan Telepon',
                'code' => 'INTERNET',
                'type' => 'expense',
                'description' => 'Biaya internet, telepon, dan komunikasi',
                'icon' => 'wifi',
                'color' => '#4B5563'
            ]
        ];

        foreach ($categories as $categoryData) {
            Category::firstOrCreate(
                ['code' => $categoryData['code']],
                $categoryData
            );
        }

        $this->command->info('✅ Kategori transaksi berhasil dibuat!');
        $this->command->info('📊 ' . count($categories) . ' kategori telah ditambahkan');
    }
}