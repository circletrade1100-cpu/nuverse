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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('nama_lengkap');
            $table->string('nama_panggilan');
            $table->string('nisn')->unique();
            $table->string('tempat_lahir');
            $table->date('tanggal_lahir');
            $table->string('nama_ibu');
            $table->string('nama_ayah');
            $table->string('nomor_hp');
            $table->text('alamat');
            $table->string('email')->unique();
            $table->string('unit_sekolah'); // SMP, SMA, dll
            $table->string('unit_kelas'); // 7A, 8B, dll
            $table->string('password');
            $table->string('avatar')->nullable();
            $table->enum('status', ['Aktif', 'Non-Aktif', 'Lulus', 'Pindah'])->default('Aktif');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
