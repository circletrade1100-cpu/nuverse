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
        Schema::create('gurus', function (Blueprint $table) {
            $table->id();
            $table->string('nama_lengkap');
            $table->string('nip')->unique();
            $table->unsignedBigInteger('jabatan_id');
            $table->enum('status', ['Aktif', 'Non-Aktif', 'Pensiun'])->default('Aktif');
            $table->date('tmt'); // Tanggal Mulai Tugas
            $table->unsignedBigInteger('unit_sekolah_id');
            $table->string('tempat_lahir');
            $table->date('tanggal_lahir');
            $table->string('jenjang_pendidikan');
            $table->string('jurusan');
            $table->enum('status_pernikahan', ['Menikah', 'Belum Menikah', 'Janda/Duda']);
            $table->string('tugas_tambahan')->nullable();
            $table->json('mapel_diampu')->nullable(); // Array mata pelajaran
            $table->integer('jam_mengajar')->nullable();
            $table->string('email')->unique();
            $table->string('no_telepon')->nullable();
            $table->text('alamat')->nullable();
            $table->string('avatar')->nullable();
            $table->string('username')->unique();
            $table->string('password');
            $table->timestamps();
            
            // Foreign key constraints
            $table->foreign('jabatan_id')->references('id')->on('jabatans')->onDelete('restrict');
            $table->foreign('unit_sekolah_id')->references('id')->on('unit_sekolahs')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gurus');
    }
};
