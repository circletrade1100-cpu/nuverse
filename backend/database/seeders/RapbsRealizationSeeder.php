<?php

namespace Database\Seeders;

use App\Models\RapbsRealization;
use App\Models\RealizationDocument;
use App\Models\RapbsPlan;
use App\Models\User;
use Illuminate\Database\Seeder;

class RapbsRealizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get required data
        $user = User::first();
        if (!$user) {
            $this->command->warn('No users found. Skipping RAPBS Realizations seeder.');
            return;
        }

        // Get approved plans only
        $approvedPlans = RapbsPlan::where('status', 'approved')->get();
        
        if ($approvedPlans->isEmpty()) {
            $this->command->warn('No approved RAPBS plans found. Skipping RAPBS Realizations seeder.');
            return;
        }

        $realizationCount = 0;
        $documentCount = 0;

        foreach ($approvedPlans as $plan) {
            // Create 2-3 realizations per approved plan
            $numRealizations = rand(2, 3);
            $totalPlanned = $plan->planned_amount;
            $remainingAmount = $totalPlanned;
            
            for ($i = 1; $i <= $numRealizations; $i++) {
                // Calculate amount (distribute budget across realizations)
                if ($i === $numRealizations) {
                    // Last realization gets remaining amount
                    $amount = $remainingAmount;
                } else {
                    // Random portion of remaining budget
                    $percentage = rand(20, 40);
                    $amount = ($remainingAmount * $percentage) / 100;
                    $remainingAmount -= $amount;
                }

                $realization = RapbsRealization::create([
                    'rapbs_plan_id' => $plan->id,
                    'transaction_date' => now()->subDays(rand(1, 60))->format('Y-m-d'),
                    'amount' => round($amount, 2),
                    'description' => $this->getRealizationDescription($plan->title, $i),
                    'vendor_name' => $this->getVendorName($i),
                    'payment_method' => $this->getPaymentMethod($i),
                    'reference_number' => 'TRF-' . now()->format('Y') . '-' . str_pad($realizationCount + $i, 4, '0', STR_PAD_LEFT),
                    'created_by' => $user->id
                ]);

                $realizationCount++;

                // Create 1-2 documents for each realization
                $numDocs = rand(1, 2);
                for ($j = 1; $j <= $numDocs; $j++) {
                    $docType = $j === 1 ? 'receipt' : ($j === 2 ? 'invoice' : 'fpu');
                    
                    RealizationDocument::create([
                        'realization_id' => $realization->id,
                        'document_type' => $docType,
                        'file_name' => $this->getDocumentFileName($docType, $realization->id),
                        'file_path' => "rapbs/realization-documents/{$docType}_{$realization->id}_" . time() . ".pdf",
                        'file_size' => rand(100000, 500000),
                        'mime_type' => 'application/pdf',
                        'validation_status' => $this->getValidationStatus($j),
                        'validated_by' => in_array($this->getValidationStatus($j), ['validated', 'rejected']) ? $user->id : null,
                        'validated_at' => in_array($this->getValidationStatus($j), ['validated', 'rejected']) ? now()->subDays(rand(1, 30)) : null,
                        'notes' => $this->getValidationNotes($this->getValidationStatus($j))
                    ]);

                    $documentCount++;
                }
            }
        }

        $this->command->info("RAPBS Realizations seeded successfully! ({$realizationCount} realizations, {$documentCount} documents)");
    }

    private function getRealizationDescription($planTitle, $phase)
    {
        $descriptions = [
            1 => "Pembayaran DP pertama untuk {$planTitle}",
            2 => "Pembayaran termin kedua untuk {$planTitle}",
            3 => "Pelunasan pembayaran untuk {$planTitle}"
        ];

        return $descriptions[$phase] ?? "Pembayaran untuk {$planTitle}";
    }

    private function getVendorName($index)
    {
        $vendors = [
            'PT Teknologi Komputer Indonesia',
            'CV Mitra Pembangunan',
            'PT Edukasi Nusantara',
            'CV Karya Mandiri',
            'PT Solusi Digital'
        ];

        return $vendors[($index - 1) % count($vendors)];
    }

    private function getPaymentMethod($index)
    {
        $methods = ['transfer', 'transfer', 'cash', 'check'];
        return $methods[($index - 1) % count($methods)];
    }

    private function getValidationStatus($docNumber)
    {
        // First document usually validated, second might be pending
        $statuses = ['validated', 'validated', 'pending', 'validated'];
        return $statuses[($docNumber - 1) % count($statuses)];
    }

    private function getDocumentFileName($type, $realizationId)
    {
        $names = [
            'receipt' => "Kwitansi_Pembayaran_{$realizationId}.pdf",
            'invoice' => "Invoice_{$realizationId}.pdf",
            'fpu' => "FPU_{$realizationId}.pdf",
            'other' => "Dokumen_Pendukung_{$realizationId}.pdf"
        ];

        return $names[$type] ?? "Dokumen_{$realizationId}.pdf";
    }

    private function getValidationNotes($status)
    {
        $notes = [
            'validated' => 'Dokumen lengkap dan sesuai',
            'pending' => null,
            'rejected' => 'Dokumen kurang lengkap, mohon dilengkapi'
        ];

        return $notes[$status] ?? null;
    }
}

