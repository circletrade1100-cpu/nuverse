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
        Schema::create('rapbs_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('role', ['planner', 'approver', 'executor', 'viewer']);
            $table->foreignId('division_id')->nullable()->constrained('unit_kerjas')->onDelete('set null');
            $table->text('permissions')->nullable();
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('role');
            $table->index('division_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rapbs_users');
    }
};

