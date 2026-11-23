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
        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->datetime('check_in')->nullable();
            $table->datetime('check_out')->nullable();
            $table->string('location')->nullable(); // Lokasi absen
            $table->string('ip_address')->nullable();
            $table->enum('status', ['present', 'late', 'absent', 'sick', 'leave'])->default('present');
            $table->text('notes')->nullable();
            $table->decimal('work_hours', 5, 2)->nullable(); // Jam kerja
            $table->boolean('is_overtime')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_logs');
    }
};
