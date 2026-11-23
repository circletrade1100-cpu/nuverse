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
        Schema::create('thr', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('guru_id'); // Foreign key ke table gurus
            $table->integer('tahun')->default(date('Y')); // Tahun THR
            $table->integer('jumlah_tatap_muka')->default(0); // Jumlah Tatap Muka (angka)
            $table->bigInteger('tatap_muka_rupiah')->default(0); // Tatap Muka dalam Rupiah
            $table->bigInteger('total_rupiah')->default(0); // Total dalam Rupiah
            $table->bigInteger('keterangan_rupiah')->default(0); // Keterangan dalam Rupiah (sama dengan total)
            $table->string('created_by')->nullable();
            $table->date('created_date')->nullable();
            $table->timestamps();
            
            // Foreign key ke table gurus
            $table->foreign('guru_id')->references('id')->on('gurus')->onDelete('cascade');
            
            // Index untuk performa
            $table->index(['guru_id', 'tahun']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('thr');
    }
};
