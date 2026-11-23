<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('payroll_input_tu')) {
            return; // Tabel sudah ada, skip migration
        }
        
        Schema::create('payroll_input_tu', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('guru_id');
            $table->unsignedBigInteger('unit_sekolah_id');
            $table->string('periode_bulan', 20);
            $table->string('periode_tahun', 4);
            
            // Data dari TU Unit
            $table->integer('bimbel')->default(0);
            $table->integer('proyek')->default(0);
            $table->integer('eskul')->default(0);
            $table->integer('pramuka')->default(0);
            $table->integer('t_muka_pengganti_gaji_pokok')->default(0);  // untuk gaji pokok
            $table->integer('t_muka_pengganti_potongan')->default(0);    // untuk potongan standar
            $table->integer('insentif_lain')->default(0);
            $table->integer('potongan_lain')->default(0);
            
            $table->enum('status', ['Draft', 'Submitted', 'Approved'])->default('Draft');
            $table->string('created_by', 100)->nullable();
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('guru_id')->references('id')->on('gurus')->onDelete('cascade');
            $table->foreign('unit_sekolah_id')->references('id')->on('unit_sekolahs')->onDelete('cascade');
            
            // Unique constraint: satu guru hanya bisa punya satu input per periode
            $table->unique(['guru_id', 'periode_bulan', 'periode_tahun'], 'unique_guru_periode');
            
            // Index untuk performa query (dengan nama custom yang lebih pendek)
            $table->index(['unit_sekolah_id', 'periode_bulan', 'periode_tahun'], 'idx_payroll_tu_unit_periode');
            $table->index('status', 'idx_payroll_tu_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_input_tu');
    }
};
