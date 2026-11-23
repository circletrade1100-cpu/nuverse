<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\User;
use Carbon\Carbon;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $incomeCategories = Category::where('type', 'income')->get();
        $expenseCategories = Category::where('type', 'expense')->get();

        if ($users->isEmpty() || $incomeCategories->isEmpty() || $expenseCategories->isEmpty()) {
            $this->command->warn('Tidak ada user atau kategori. Pastikan SuperAdminSeeder dan CategorySeeder sudah dijalankan.');
            return;
        }

        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        // Sample transactions for today
        $todayTransactions = [
            // Income transactions
            [
                'user_id' => $users->random()->id,
                'category_id' => $incomeCategories->where('code', 'SPP')->first()?->id ?? $incomeCategories->random()->id,
                'type' => 'income',
                'title' => 'Pembayaran SPP Kelas VII-A',
                'description' => 'Pembayaran SPP bulan ' . Carbon::now()->format('F Y'),
                'amount' => 500000,
                'transaction_date' => $today,
                'status' => 'completed',
                'created_at' => $today,
                'updated_at' => $today
            ],
            [
                'user_id' => $users->random()->id,
                'category_id' => $incomeCategories->where('code', 'SPP')->first()?->id ?? $incomeCategories->random()->id,
                'type' => 'income',
                'title' => 'Pembayaran SPP Kelas VIII-B',
                'description' => 'Pembayaran SPP bulan ' . Carbon::now()->format('F Y'),
                'amount' => 500000,
                'transaction_date' => $today,
                'status' => 'completed',
                'created_at' => $today,
                'updated_at' => $today
            ],
            [
                'user_id' => $users->random()->id,
                'category_id' => $incomeCategories->where('code', 'DAFTAR_ULANG')->first()?->id ?? $incomeCategories->random()->id,
                'type' => 'income',
                'title' => 'Daftar Ulang Siswa Baru',
                'description' => 'Pembayaran daftar ulang tahun ajaran baru',
                'amount' => 1500000,
                'transaction_date' => $today,
                'status' => 'completed',
                'created_at' => $today,
                'updated_at' => $today
            ],

            // Expense transactions
            [
                'user_id' => $users->random()->id,
                'category_id' => $expenseCategories->where('code', 'LISTRIK')->first()?->id ?? $expenseCategories->random()->id,
                'type' => 'expense',
                'title' => 'Pembayaran Listrik Bulan ' . Carbon::now()->format('F'),
                'description' => 'Tagihan listrik untuk gedung sekolah',
                'amount' => 2500000,
                'transaction_date' => $today,
                'status' => 'pending',
                'created_at' => $today,
                'updated_at' => $today
            ],
            [
                'user_id' => $users->random()->id,
                'category_id' => $expenseCategories->where('code', 'ATK')->first()?->id ?? $expenseCategories->random()->id,
                'type' => 'expense',
                'title' => 'Pembelian Alat Tulis Kantor',
                'description' => 'Pulpen, kertas, tinta printer untuk keperluan administrasi',
                'amount' => 850000,
                'transaction_date' => $today,
                'status' => 'pending',
                'created_at' => $today,
                'updated_at' => $today
            ]
        ];

        // Sample transactions for this month
        $monthlyTransactions = [
            // More income transactions
            [
                'user_id' => $users->random()->id,
                'category_id' => $incomeCategories->where('code', 'SERAGAM')->first()?->id ?? $incomeCategories->random()->id,
                'type' => 'income',
                'title' => 'Penjualan Seragam Sekolah',
                'description' => 'Penjualan seragam untuk siswa kelas VII',
                'amount' => 3500000,
                'transaction_date' => $thisMonth->copy()->addDays(5),
                'status' => 'completed',
                'created_at' => $thisMonth->copy()->addDays(5),
                'updated_at' => $thisMonth->copy()->addDays(5)
            ],
            [
                'user_id' => $users->random()->id,
                'category_id' => $incomeCategories->where('code', 'BUKU')->first()?->id ?? $incomeCategories->random()->id,
                'type' => 'income',
                'title' => 'Penjualan Buku Pelajaran',
                'description' => 'Buku paket untuk semester baru',
                'amount' => 2750000,
                'transaction_date' => $thisMonth->copy()->addDays(10),
                'status' => 'completed',
                'created_at' => $thisMonth->copy()->addDays(10),
                'updated_at' => $thisMonth->copy()->addDays(10)
            ],

            // More expense transactions
            [
                'user_id' => $users->random()->id,
                'category_id' => $expenseCategories->where('code', 'GAJI_GURU')->first()?->id ?? $expenseCategories->random()->id,
                'type' => 'expense',
                'title' => 'Gaji Guru Bulan ' . Carbon::now()->format('F'),
                'description' => 'Pembayaran gaji untuk seluruh guru',
                'amount' => 45000000,
                'transaction_date' => $thisMonth->copy()->addDays(1),
                'status' => 'completed',
                'created_at' => $thisMonth->copy()->addDays(1),
                'updated_at' => $thisMonth->copy()->addDays(1)
            ],
            [
                'user_id' => $users->random()->id,
                'category_id' => $expenseCategories->where('code', 'GAJI_STAFF')->first()?->id ?? $expenseCategories->random()->id,
                'type' => 'expense',
                'title' => 'Gaji Staff TU Bulan ' . Carbon::now()->format('F'),
                'description' => 'Pembayaran gaji untuk staff tata usaha',
                'amount' => 12000000,
                'transaction_date' => $thisMonth->copy()->addDays(1),
                'status' => 'completed',
                'created_at' => $thisMonth->copy()->addDays(1),
                'updated_at' => $thisMonth->copy()->addDays(1)
            ],
            [
                'user_id' => $users->random()->id,
                'category_id' => $expenseCategories->where('code', 'MAINTENANCE')->first()?->id ?? $expenseCategories->random()->id,
                'type' => 'expense',
                'title' => 'Perbaikan Proyektor Kelas',
                'description' => 'Service dan penggantian lampu proyektor',
                'amount' => 1250000,
                'transaction_date' => $thisMonth->copy()->addDays(15),
                'status' => 'completed',
                'created_at' => $thisMonth->copy()->addDays(15),
                'updated_at' => $thisMonth->copy()->addDays(15)
            ]
        ];

        // Insert all transactions
        $allTransactions = array_merge($todayTransactions, $monthlyTransactions);
        
        foreach ($allTransactions as $transaction) {
            Transaction::create($transaction);
        }

        $this->command->info('Sample transactions created successfully!');
        $this->command->info('Total transactions: ' . count($allTransactions));
        $this->command->info('Today transactions: ' . count($todayTransactions));
        $this->command->info('Monthly transactions: ' . count($monthlyTransactions));
    }
}