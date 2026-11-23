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
        Schema::create('lpj_rapbs_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lpj_id')->constrained('lpjs')->onDelete('cascade');
            $table->foreignId('rapbs_plan_id')->constrained('rapbs_plans')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(['lpj_id', 'rapbs_plan_id']);
            $table->index('lpj_id');
            $table->index('rapbs_plan_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lpj_rapbs_plans');
    }
};
