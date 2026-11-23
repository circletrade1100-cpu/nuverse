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
        Schema::create('maintenance_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->enum('maintenance_type', ['preventive', 'corrective', 'emergency', 'upgrade'])->default('preventive');
            $table->string('frequency', 50)->nullable(); // daily, weekly, monthly, yearly
            $table->date('last_maintenance')->nullable();
            $table->date('next_maintenance')->nullable();
            $table->foreignId('technician_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('estimated_duration', 50)->nullable();
            $table->text('required_materials')->nullable();
            $table->text('checklist')->nullable();
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'overdue'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_schedules');
    }
};

