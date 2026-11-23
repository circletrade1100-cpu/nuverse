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
        Schema::create('activity_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rapbs_plan_id')->constrained('rapbs_plans')->onDelete('cascade');
            $table->enum('note_type', ['progress', 'issue', 'completion']);
            $table->string('title', 200);
            $table->text('content');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            
            $table->index('rapbs_plan_id');
            $table->index('note_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_notes');
    }
};

