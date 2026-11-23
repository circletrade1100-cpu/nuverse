<?php

namespace Database\Seeders;

use App\Models\RapbsPlan;
use App\Models\BudgetBreakdown;
use App\Models\User;
use App\Models\AcademicYear;
use App\Models\ActivityCategory;
use App\Models\FundingSource;
use Illuminate\Database\Seeder;

class RapbsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get required data
        $user = User::first();
        if (!$user) {
            $this->command->warn('No users found. Skipping RAPBS seeder.');
            return;
        }

        $academicYear = AcademicYear::where('status', 'active')->first();
        if (!$academicYear) {
            $this->command->warn('No active academic year found. Skipping RAPBS seeder.');
            return;
        }

        $expenseCategory = ActivityCategory::where('budget_type', 'expense')->first();
        $fundingSource = FundingSource::where('status', 'active')->first();

        if (!$expenseCategory || !$fundingSource) {
            $this->command->warn('Missing categories or funding sources. Skipping RAPBS seeder.');
            return;
        }

        // Create sample RAPBS plans
        $plans = [
            [
                'academic_year_id' => $academicYear->id,
                'activity_category_id' => $expenseCategory->id,
                'funding_source_id' => $fundingSource->id,
                'title' => 'Pengadaan Komputer Lab',
                'description' => 'Pengadaan komputer baru untuk laboratorium komputer sekolah',
                'planned_amount' => 50000000,
                'priority' => 'high',
                'status' => 'approved',
                'submitted_by' => $user->id,
                'approved_by' => $user->id,
                'approved_at' => now(),
            ],
            [
                'academic_year_id' => $academicYear->id,
                'activity_category_id' => $expenseCategory->id,
                'funding_source_id' => $fundingSource->id,
                'title' => 'Renovasi Perpustakaan',
                'description' => 'Renovasi dan modernisasi perpustakaan sekolah',
                'planned_amount' => 75000000,
                'priority' => 'medium',
                'status' => 'submitted',
                'submitted_by' => $user->id,
            ],
            [
                'academic_year_id' => $academicYear->id,
                'activity_category_id' => $expenseCategory->id,
                'funding_source_id' => $fundingSource->id,
                'title' => 'Program Pelatihan Guru',
                'description' => 'Pelatihan dan pengembangan kompetensi guru',
                'planned_amount' => 30000000,
                'priority' => 'high',
                'status' => 'approved',
                'submitted_by' => $user->id,
                'approved_by' => $user->id,
                'approved_at' => now(),
            ],
            [
                'academic_year_id' => $academicYear->id,
                'activity_category_id' => $expenseCategory->id,
                'funding_source_id' => $fundingSource->id,
                'title' => 'Pengadaan Buku Pelajaran',
                'description' => 'Pengadaan buku pelajaran untuk siswa',
                'planned_amount' => 25000000,
                'priority' => 'urgent',
                'status' => 'draft',
                'submitted_by' => $user->id,
            ],
        ];

        foreach ($plans as $planData) {
            $plan = RapbsPlan::create($planData);

            // Create budget breakdown for approved plans
            if ($plan->status === 'approved') {
                BudgetBreakdown::create([
                    'rapbs_plan_id' => $plan->id,
                    'item_name' => 'Item Utama',
                    'quantity' => 1,
                    'unit_price' => $plan->planned_amount,
                    'total_amount' => $plan->planned_amount,
                    'notes' => 'Breakdown utama dari anggaran',
                ]);
            }
        }

        $this->command->info('RAPBS plans seeded successfully!');
    }
}

