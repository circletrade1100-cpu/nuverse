<?php

namespace Database\Seeders;

use App\Models\RapbsDocument;
use App\Models\RapbsPlan;
use App\Models\User;
use Illuminate\Database\Seeder;

class RapbsDocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get required data
        $user = User::first();
        if (!$user) {
            $this->command->warn('No users found. Skipping RAPBS Documents seeder.');
            return;
        }

        $plans = RapbsPlan::all();
        if ($plans->isEmpty()) {
            $this->command->warn('No RAPBS plans found. Skipping RAPBS Documents seeder.');
            return;
        }

        // Create sample documents for each approved plan
        foreach ($plans as $plan) {
            if (in_array($plan->status, ['approved', 'submitted'])) {
                // Proposal document
                RapbsDocument::create([
                    'rapbs_plan_id' => $plan->id,
                    'document_type' => 'proposal',
                    'file_name' => "Proposal_{$plan->title}.pdf",
                    'file_path' => "rapbs/documents/proposal_{$plan->id}_" . time() . ".pdf",
                    'file_size' => rand(100000, 500000), // 100KB - 500KB
                    'mime_type' => 'application/pdf',
                    'uploaded_by' => $user->id
                ]);

                // Budget detail document
                RapbsDocument::create([
                    'rapbs_plan_id' => $plan->id,
                    'document_type' => 'budget_detail',
                    'file_name' => "RAB_{$plan->title}.xlsx",
                    'file_path' => "rapbs/documents/rab_{$plan->id}_" . time() . ".xlsx",
                    'file_size' => rand(50000, 200000), // 50KB - 200KB
                    'mime_type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'uploaded_by' => $user->id
                ]);

                // Supporting document
                RapbsDocument::create([
                    'rapbs_plan_id' => $plan->id,
                    'document_type' => 'supporting_doc',
                    'file_name' => "Lampiran_{$plan->title}.pdf",
                    'file_path' => "rapbs/documents/lampiran_{$plan->id}_" . time() . ".pdf",
                    'file_size' => rand(150000, 600000), // 150KB - 600KB
                    'mime_type' => 'application/pdf',
                    'uploaded_by' => $user->id
                ]);
            }
        }

        $this->command->info('RAPBS Documents seeded successfully!');
    }
}

