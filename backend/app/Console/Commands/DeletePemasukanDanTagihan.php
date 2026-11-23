<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DeletePemasukanDanTagihan extends Command
{
    /**
     * @var string
     */
    protected $signature = 'delete:pemasukan-tagihan
                            {--force : Tanpa konfirmasi interaktif}
                            {--dry-run : Hanya tampilkan jumlah baris yang akan dihapus}';

    /**
     * @var string
     */
    protected $description = 'Hapus semua data tagihan siswa, pembayaran terkait, Midtrans, notifikasi tagihan, dan pemasukan TU (transactions income)';

    public function handle(): int
    {
        if ($this->option('dry-run')) {
            return $this->runDryRun();
        }

        if (!$this->option('force')) {
            if (!$this->confirm('Hapus SEMUA tagihan siswa, pembayaran tagihan, catatan Midtrans terkait, notifikasi kategori tagihan, dan semua pemasukan TU (transactions type=income)? Tindakan ini tidak dapat dibatalkan.')) {
                $this->info('Operasi dibatalkan.');
                return self::SUCCESS;
            }
        }

        $this->info('Memulai penghapusan...');

        try {
            DB::transaction(function () {
                // Urutan: student_bills dulu agar FK cascade menghapus bill_payments & payments
                $studentBillsCount = DB::table('student_bills')->count();
                $this->line("Menghapus student_bills ({$studentBillsCount} baris) beserta bill_payments & payments terkait...");
                DB::table('student_bills')->delete();
                $this->info('✓ Tagihan siswa dan pembayaran tercatat dihapus (cascade).');

                if (Schema::hasTable('midtrans_transactions')) {
                    $midtransCount = DB::table('midtrans_transactions')->count();
                    $this->line("Menghapus midtrans_transactions ({$midtransCount} baris)...");
                    DB::table('midtrans_transactions')->delete();
                    $this->info('✓ Data Midtrans terkait tagihan dihapus.');
                }

                if (Schema::hasTable('notifications')) {
                    $notifCount = DB::table('notifications')
                        ->where('category', 'tagihan')
                        ->count();
                    $this->line("Menghapus notifications dengan category=tagihan ({$notifCount} baris)...");
                    DB::table('notifications')->where('category', 'tagihan')->delete();
                    $this->info('✓ Notifikasi tagihan/pembayaran tagihan dihapus.');
                }

                $transactionsIncomeCount = DB::table('transactions')->where('type', 'income')->count();
                $this->line("Menghapus transactions type=income ({$transactionsIncomeCount} baris)...");
                DB::table('transactions')->where('type', 'income')->delete();
                $this->info('✓ Pemasukan TU dihapus.');

                if (Schema::hasTable('business_transactions')) {
                    $businessIncomeCount = DB::table('business_transactions')
                        ->where('transaction_type', 'income')
                        ->count();
                    $this->line("Menghapus business_transactions type=income ({$businessIncomeCount} baris)...");
                    DB::table('business_transactions')->where('transaction_type', 'income')->delete();
                    $this->info('✓ Pemasukan dana usaha dihapus.');
                }
            });

            $this->newLine();
            $this->info('Selesai: data tagihan dan pemasukan terkait telah dikosongkan.');

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Gagal: '.$e->getMessage());
            report($e);

            return self::FAILURE;
        }
    }

    private function runDryRun(): int
    {
        $this->warn('Mode dry-run — tidak ada data yang diubah.');
        $this->newLine();

        $rows = [
            ['Tabel / filter', 'Jumlah baris'],
            ['student_bills (semua)', (string) DB::table('student_bills')->count()],
            ['bill_payments (semua)', Schema::hasTable('bill_payments') ? (string) DB::table('bill_payments')->count() : '—'],
            ['payments (semua)', Schema::hasTable('payments') ? (string) DB::table('payments')->count() : '—'],
            ['midtrans_transactions (semua)', Schema::hasTable('midtrans_transactions') ? (string) DB::table('midtrans_transactions')->count() : '—'],
            ['notifications category=tagihan', Schema::hasTable('notifications') ? (string) DB::table('notifications')->where('category', 'tagihan')->count() : '—'],
            ['transactions type=income', (string) DB::table('transactions')->where('type', 'income')->count()],
            ['business_transactions transaction_type=income', Schema::hasTable('business_transactions') ? (string) DB::table('business_transactions')->where('transaction_type', 'income')->count() : '—'],
        ];

        $this->table($rows[0], array_slice($rows, 1));
        $this->newLine();
        $this->line('Jalankan tanpa --dry-run untuk menghapus (disarankan backup database dulu).');

        return self::SUCCESS;
    }
}
