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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nama kategori
            $table->string('code')->unique(); // Kode kategori (SPP, ESKUL, dll)
            $table->enum('type', ['income', 'expense']); // Tipe kategori
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('icon')->nullable(); // Icon untuk UI
            $table->string('color')->nullable(); // Warna untuk UI
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
