<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Cek apakah tabel ada
        if (!Schema::hasTable('payroll_input_tu')) {
            return;
        }

        Schema::table('payroll_input_tu', function (Blueprint $table) {
            // Cek apakah index sudah ada dengan query langsung
            $indexes = DB::select("SHOW INDEXES FROM payroll_input_tu WHERE Key_name = 'idx_payroll_tu_unit_periode'");
            if (empty($indexes)) {
                try {
                    $table->index(['unit_sekolah_id', 'periode_bulan', 'periode_tahun'], 'idx_payroll_tu_unit_periode');
                } catch (\Exception $e) {
                    // Index mungkin sudah ada dengan nama lain, skip
                }
            }
            
            $indexes = DB::select("SHOW INDEXES FROM payroll_input_tu WHERE Key_name = 'idx_payroll_tu_status'");
            if (empty($indexes)) {
                try {
                    $table->index('status', 'idx_payroll_tu_status');
                } catch (\Exception $e) {
                    // Index mungkin sudah ada dengan nama lain, skip
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payroll_input_tu', function (Blueprint $table) {
            $table->dropIndex('idx_payroll_tu_unit_periode');
            $table->dropIndex('idx_payroll_tu_status');
        });
    }
};
