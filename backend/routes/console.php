<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// =============================================
// SCHEDULER - OneSignal Absensi Notifications
// =============================================

// Cek absen masuk setiap hari Senin-Jumat jam 08:30 WIB
Schedule::command('absensi:check-masuk')
    ->weekdays()
    ->dailyAt('08:30')
    ->timezone('Asia/Jakarta')
    ->onSuccess(function () {
        \Log::info('✅ Scheduler absensi:check-masuk berhasil dijalankan');
    })
    ->onFailure(function () {
        \Log::error('❌ Scheduler absensi:check-masuk gagal dijalankan');
    });

// Cek absen keluar setiap hari Senin-Jumat jam 16:00 WIB
Schedule::command('absensi:check-keluar')
    ->weekdays()
    ->dailyAt('16:00')
    ->timezone('Asia/Jakarta')
    ->onSuccess(function () {
        \Log::info('✅ Scheduler absensi:check-keluar berhasil dijalankan');
    })
    ->onFailure(function () {
        \Log::error('❌ Scheduler absensi:check-keluar gagal dijalankan');
    });

// =============================================
// SCHEDULER - OneSignal Tagihan Notifications
// =============================================

// Cek tagihan jatuh tempo (H-3 dan H-0) setiap hari jam 09:00 WIB
Schedule::command('tagihan:check-jatuh-tempo')
    ->dailyAt('09:00')
    ->timezone('Asia/Jakarta')
    ->onSuccess(function () {
        \Log::info('✅ Scheduler tagihan:check-jatuh-tempo berhasil dijalankan');
    })
    ->onFailure(function () {
        \Log::error('❌ Scheduler tagihan:check-jatuh-tempo gagal dijalankan');
    });

// Cek tagihan overdue setiap hari jam 10:00 WIB
Schedule::command('tagihan:check-overdue')
    ->dailyAt('10:00')
    ->timezone('Asia/Jakarta')
    ->onSuccess(function () {
        \Log::info('✅ Scheduler tagihan:check-overdue berhasil dijalankan');
    })
    ->onFailure(function () {
        \Log::error('❌ Scheduler tagihan:check-overdue gagal dijalankan');
    });
