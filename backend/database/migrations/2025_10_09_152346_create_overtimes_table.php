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
        Schema::create('overtimes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_guru');
            $table->date('tanggal');
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->integer('durasi'); // Durasi dalam jam
            $table->string('jenis');
            $table->text('deskripsi');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->integer('tarif'); // Tarif per jam
            $table->integer('total'); // Total pembayaran
            $table->string('supervisor')->nullable();
            $table->unsignedBigInteger('disetujui_oleh')->nullable();
            $table->date('tanggal_disetujui')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('id_guru')->references('id')->on('gurus')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('gurus')->onDelete('cascade');
            $table->foreign('disetujui_oleh')->references('id')->on('users')->onDelete('set null');
            
            // Index untuk performa query
            $table->index(['id_guru', 'tanggal']);
            $table->index('status');
            $table->index('tanggal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('overtimes');
    }
};
