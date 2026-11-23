<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Student;
use App\Models\BillType;
use App\Models\StudentBill;
use Carbon\Carbon;

class StudentBillSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil semua siswa dan bill types
        $students = Student::where('status', 'Aktif')->get();
        $billTypes = BillType::where('is_active', true)->get();

        if ($students->isEmpty()) {
            $this->command->warn('⚠️ Tidak ada siswa aktif. Jalankan StudentSeeder terlebih dahulu.');
            return;
        }

        if ($billTypes->isEmpty()) {
            $this->command->warn('⚠️ Tidak ada jenis tagihan. Jalankan BillTypeSeeder terlebih dahulu.');
            return;
        }

        // Ambil jenis tagihan
        $sppType = $billTypes->where('name', 'SPP')->first();
        $uangPangkalType = $billTypes->where('name', 'Uang Pangkal')->first();
        $seragamType = $billTypes->where('name', 'Seragam')->first();
        $kegiatanType = $billTypes->where('name', 'Kegiatan')->first();
        $bukuType = $billTypes->where('name', 'Buku Paket')->first();

        foreach ($students as $student) {
            $bills = [];

            // 1. SPP Bulan ini (Belum Bayar)
            if ($sppType) {
                $bills[] = [
                    'student_id' => $student->id,
                    'bill_type_id' => $sppType->id,
                    'total_amount' => 750000,
                    'paid_amount' => 0,
                    'remaining_amount' => 750000,
                    'due_date' => Carbon::now()->endOfMonth()->format('Y-m-d'),
                    'period_month' => Carbon::now()->month,
                    'period_year' => Carbon::now()->year,
                    'status' => 'unpaid',
                    'allow_installment' => true,
                    'notes' => 'Pembayaran SPP ' . Carbon::now()->locale('id')->monthName . ' ' . Carbon::now()->year,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // 2. SPP Bulan lalu (Terlambat)
            if ($sppType) {
                $lastMonth = Carbon::now()->subMonth();
                $bills[] = [
                    'student_id' => $student->id,
                    'bill_type_id' => $sppType->id,
                    'total_amount' => 750000,
                    'paid_amount' => 0,
                    'remaining_amount' => 750000,
                    'due_date' => $lastMonth->endOfMonth()->format('Y-m-d'),
                    'period_month' => $lastMonth->month,
                    'period_year' => $lastMonth->year,
                    'status' => 'overdue',
                    'allow_installment' => true,
                    'notes' => 'Pembayaran SPP ' . $lastMonth->locale('id')->monthName . ' ' . $lastMonth->year . ' - TERLAMBAT',
                    'created_at' => $lastMonth,
                    'updated_at' => now(),
                ];
            }

            // 3. SPP 2 Bulan lalu (Lunas)
            if ($sppType) {
                $twoMonthsAgo = Carbon::now()->subMonths(2);
                $bills[] = [
                    'student_id' => $student->id,
                    'bill_type_id' => $sppType->id,
                    'total_amount' => 750000,
                    'paid_amount' => 750000,
                    'remaining_amount' => 0,
                    'due_date' => $twoMonthsAgo->endOfMonth()->format('Y-m-d'),
                    'period_month' => $twoMonthsAgo->month,
                    'period_year' => $twoMonthsAgo->year,
                    'status' => 'paid',
                    'allow_installment' => true,
                    'notes' => 'Pembayaran SPP ' . $twoMonthsAgo->locale('id')->monthName . ' ' . $twoMonthsAgo->year . ' - LUNAS',
                    'created_at' => $twoMonthsAgo,
                    'updated_at' => $twoMonthsAgo->addDays(10),
                ];
            }

            // 4. Uang Seragam (Cicilan)
            if ($seragamType) {
                $bills[] = [
                    'student_id' => $student->id,
                    'bill_type_id' => $seragamType->id,
                    'total_amount' => 1500000,
                    'paid_amount' => 750000,
                    'remaining_amount' => 750000,
                    'due_date' => Carbon::now()->addMonth()->endOfMonth()->format('Y-m-d'),
                    'period_month' => null,
                    'period_year' => Carbon::now()->year,
                    'status' => 'partial',
                    'allow_installment' => true,
                    'notes' => 'Seragam lengkap (Harian, Olahraga, Batik) - Cicilan 1 dari 2',
                    'created_at' => Carbon::now()->subMonth(),
                    'updated_at' => now(),
                ];
            }

            // 5. Buku Paket (Belum Bayar)
            if ($bukuType) {
                $bills[] = [
                    'student_id' => $student->id,
                    'bill_type_id' => $bukuType->id,
                    'total_amount' => 850000,
                    'paid_amount' => 0,
                    'remaining_amount' => 850000,
                    'due_date' => Carbon::now()->addWeeks(2)->format('Y-m-d'),
                    'period_month' => null,
                    'period_year' => Carbon::now()->year,
                    'status' => 'unpaid',
                    'allow_installment' => false,
                    'notes' => 'Buku paket semester ' . (Carbon::now()->month >= 7 ? 'Ganjil' : 'Genap') . ' ' . Carbon::now()->year,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // 6. Kegiatan Ekstrakurikuler (Lunas)
            if ($kegiatanType) {
                $bills[] = [
                    'student_id' => $student->id,
                    'bill_type_id' => $kegiatanType->id,
                    'total_amount' => 300000,
                    'paid_amount' => 300000,
                    'remaining_amount' => 0,
                    'due_date' => Carbon::now()->subMonth()->format('Y-m-d'),
                    'period_month' => null,
                    'period_year' => Carbon::now()->year,
                    'status' => 'paid',
                    'allow_installment' => false,
                    'notes' => 'Biaya ekstrakurikuler semester ' . (Carbon::now()->month >= 7 ? 'Ganjil' : 'Genap') . ' - LUNAS',
                    'created_at' => Carbon::now()->subMonths(2),
                    'updated_at' => Carbon::now()->subMonth(),
                ];
            }

            // Insert semua tagihan
            StudentBill::insert($bills);
        }

        $totalBills = count($students) * 6;
        $this->command->info("✅ Berhasil membuat {$totalBills} data tagihan untuk " . count($students) . " siswa");
        $this->command->info("   - Setiap siswa memiliki 6 tagihan dengan status berbeda:");
        $this->command->info("     • SPP bulan ini (Belum Bayar)");
        $this->command->info("     • SPP bulan lalu (Terlambat)");
        $this->command->info("     • SPP 2 bulan lalu (Lunas)");
        $this->command->info("     • Seragam (Cicilan - sudah bayar 50%)");
        $this->command->info("     • Buku Paket (Belum Bayar)");
        $this->command->info("     • Kegiatan (Lunas)");
    }
}

