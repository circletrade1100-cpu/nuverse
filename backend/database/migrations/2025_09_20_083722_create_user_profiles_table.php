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
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('nip')->nullable()->unique();
            $table->string('jabatan')->nullable();
            $table->string('unit_kerja')->nullable();
            $table->enum('status', ['Aktif', 'Non-Aktif', 'Pensiun'])->default('Aktif');
            $table->date('tmt')->nullable(); // Tanggal Mulai Tugas
            $table->string('tempat_lahir')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('jenjang_pendidikan')->nullable();
            $table->string('jurusan')->nullable();
            $table->enum('status_pernikahan', ['Menikah', 'Belum Menikah', 'Janda/Duda'])->nullable();
            $table->string('tugas_tambahan')->nullable();
            $table->json('mapel_diampu')->nullable(); // Array mata pelajaran
            $table->integer('jam_mengajar')->nullable();
            $table->string('avatar')->nullable();
            $table->text('alamat')->nullable();
            $table->string('no_telepon')->nullable();
            $table->string('kontak_darurat')->nullable();
            $table->string('telepon_darurat')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
