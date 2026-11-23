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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->date('audit_date');
            $table->foreignId('auditor_id')->constrained('users')->onDelete('cascade');
            $table->enum('condition_before', ['baik', 'rusak_ringan', 'rusak_berat', 'tidak_berfungsi']);
            $table->enum('condition_after', ['baik', 'rusak_ringan', 'rusak_berat', 'tidak_berfungsi']);
            $table->enum('status_before', ['aktif', 'maintenance', 'penghapusan']);
            $table->enum('status_after', ['aktif', 'maintenance', 'penghapusan']);
            $table->text('findings')->nullable(); // Temuan audit
            $table->text('recommendations')->nullable(); // Rekomendasi
            $table->text('action_taken')->nullable(); // Tindakan yang diambil
            $table->decimal('estimated_repair_cost', 15, 2)->nullable(); // Estimasi biaya perbaikan
            $table->enum('audit_type', ['routine', 'special', 'emergency'])->default('routine');
            $table->string('location_verified')->nullable(); // Lokasi diverifikasi
            $table->text('photos')->nullable(); // JSON array of photo paths
            $table->timestamps();
            
            // Indexes
            $table->index(['item_id', 'audit_date']);
            $table->index('audit_date');
            $table->index('auditor_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};