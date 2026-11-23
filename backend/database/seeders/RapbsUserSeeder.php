<?php

namespace Database\Seeders;

use App\Models\RapbsUser;
use App\Models\User;
use Illuminate\Database\Seeder;

class RapbsUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first user (usually admin)
        $user = User::first();
        
        if (!$user) {
            $this->command->warn('No users found. Skipping RAPBS Users seeder.');
            return;
        }

        // Create sample RAPBS users with different roles
        $rapbsUsers = [
            [
                'user_id' => $user->id,
                'role' => 'planner',
                'division_id' => null,
                'permissions' => json_encode([
                    'create_plan',
                    'edit_plan',
                    'submit_plan',
                    'view_plan'
                ])
            ],
            [
                'user_id' => $user->id,
                'role' => 'approver',
                'division_id' => null,
                'permissions' => json_encode([
                    'view_plan',
                    'approve_plan',
                    'reject_plan'
                ])
            ],
            [
                'user_id' => $user->id,
                'role' => 'executor',
                'division_id' => null,
                'permissions' => json_encode([
                    'view_plan',
                    'create_realization',
                    'upload_document'
                ])
            ],
            [
                'user_id' => $user->id,
                'role' => 'viewer',
                'division_id' => null,
                'permissions' => json_encode([
                    'view_plan',
                    'view_report'
                ])
            ],
        ];

        foreach ($rapbsUsers as $rapbsUser) {
            RapbsUser::create($rapbsUser);
        }

        $this->command->info('RAPBS Users seeded successfully!');
    }
}

