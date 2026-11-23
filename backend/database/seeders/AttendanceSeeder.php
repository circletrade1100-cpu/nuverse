<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AttendanceLog;
use App\Models\User;
use Carbon\Carbon;

class AttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('Tidak ada user. Pastikan SuperAdminSeeder sudah dijalankan.');
            return;
        }

        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $twoDaysAgo = Carbon::now()->subDays(2);

        // Today's attendance logs
        $todayAttendance = [
            [
                'user_id' => $users->random()->id,
                'check_in' => $today->copy()->setTime(7, 30),
                'check_out' => $today->copy()->setTime(15, 30),
                'status' => 'present',
                'location' => 'Kantor TU',
                'notes' => 'Hadir tepat waktu',
                'work_hours' => 8.0,
                'created_at' => $today->copy()->setTime(7, 30),
                'updated_at' => $today->copy()->setTime(15, 30)
            ],
            [
                'user_id' => $users->random()->id,
                'check_in' => $today->copy()->setTime(8, 15),
                'check_out' => null,
                'status' => 'late',
                'location' => 'Kantor TU',
                'notes' => 'Terlambat karena macet',
                'work_hours' => null,
                'created_at' => $today->copy()->setTime(8, 15),
                'updated_at' => $today->copy()->setTime(8, 15)
            ]
        ];

        // Add more users with different statuses
        if ($users->count() > 2) {
            $todayAttendance[] = [
                'user_id' => $users->skip(2)->first()->id,
                'check_in' => null,
                'check_out' => null,
                'status' => 'absent',
                'location' => null,
                'notes' => 'Sakit',
                'work_hours' => 0,
                'created_at' => $today,
                'updated_at' => $today
            ];
        }

        // Yesterday's attendance logs
        $yesterdayAttendance = [
            [
                'user_id' => $users->random()->id,
                'check_in' => $yesterday->copy()->setTime(7, 45),
                'check_out' => $yesterday->copy()->setTime(16, 0),
                'status' => 'present',
                'location' => 'Kantor TU',
                'notes' => 'Hadir',
                'work_hours' => 8.25,
                'created_at' => $yesterday->copy()->setTime(7, 45),
                'updated_at' => $yesterday->copy()->setTime(16, 0)
            ],
            [
                'user_id' => $users->random()->id,
                'check_in' => $yesterday->copy()->setTime(7, 25),
                'check_out' => $yesterday->copy()->setTime(15, 45),
                'status' => 'present',
                'location' => 'Kantor TU',
                'notes' => 'Hadir tepat waktu',
                'work_hours' => 8.33,
                'created_at' => $yesterday->copy()->setTime(7, 25),
                'updated_at' => $yesterday->copy()->setTime(15, 45)
            ]
        ];

        // Two days ago attendance logs
        $twoDaysAgoAttendance = [
            [
                'user_id' => $users->random()->id,
                'check_in' => $twoDaysAgo->copy()->setTime(8, 0),
                'check_out' => $twoDaysAgo->copy()->setTime(15, 30),
                'status' => 'late',
                'location' => 'Kantor TU',
                'notes' => 'Terlambat',
                'work_hours' => 7.5,
                'created_at' => $twoDaysAgo->copy()->setTime(8, 0),
                'updated_at' => $twoDaysAgo->copy()->setTime(15, 30)
            ]
        ];

        // Insert all attendance logs
        $allAttendance = array_merge($todayAttendance, $yesterdayAttendance, $twoDaysAgoAttendance);
        
        foreach ($allAttendance as $attendance) {
            AttendanceLog::create($attendance);
        }

        $this->command->info('Sample attendance logs created successfully!');
        $this->command->info('Total attendance logs: ' . count($allAttendance));
        $this->command->info('Today attendance: ' . count($todayAttendance));
        $this->command->info('Yesterday attendance: ' . count($yesterdayAttendance));
    }
}