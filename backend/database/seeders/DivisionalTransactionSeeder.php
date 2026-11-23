<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DivisionalTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $transactions = [
            [
                'unit_kerja_id' => 1,
                'funding_source_id' => 1,
                'transaction_type' => 'income',
                'amount' => 5000000.00,
                'description' => 'Pendapatan dari donasi bulanan',
                'transaction_date' => '2025-01-15',
                'reference_number' => 'TRX-2025-001',
                'created_by' => 1,
            ],
            [
                'unit_kerja_id' => 1,
                'funding_source_id' => 2,
                'transaction_type' => 'expense',
                'amount' => 2500000.00,
                'description' => 'Pembelian peralatan kantor',
                'transaction_date' => '2025-01-20',
                'reference_number' => 'TRX-2025-002',
                'created_by' => 1,
            ],
            [
                'unit_kerja_id' => 2,
                'funding_source_id' => 1,
                'transaction_type' => 'income',
                'amount' => 7500000.00,
                'description' => 'Dana hibah program pendidikan',
                'transaction_date' => '2025-02-10',
                'reference_number' => 'TRX-2025-003',
                'created_by' => 1,
            ],
            [
                'unit_kerja_id' => 2,
                'funding_source_id' => 2,
                'transaction_type' => 'expense',
                'amount' => 3000000.00,
                'description' => 'Biaya operasional program',
                'transaction_date' => '2025-02-15',
                'reference_number' => 'TRX-2025-004',
                'created_by' => 1,
            ],
            [
                'unit_kerja_id' => 3,
                'funding_source_id' => 1,
                'transaction_type' => 'income',
                'amount' => 10000000.00,
                'description' => 'Pendapatan dari event fundraising',
                'transaction_date' => '2025-03-05',
                'reference_number' => 'TRX-2025-005',
                'created_by' => 1,
            ],
        ];

        foreach ($transactions as $transaction) {
            \App\Models\DivisionalTransaction::create($transaction);
        }
    }
}
