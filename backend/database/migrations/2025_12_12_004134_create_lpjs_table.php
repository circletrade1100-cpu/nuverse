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
        Schema::create('lpjs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained('academic_years')->onDelete('cascade');
            $table->foreignId('unit_kerja_id')->nullable()->constrained('unit_kerjas')->onDelete('cascade');
            $table->enum('periode_type', ['semester', 'tahunan'])->default('semester');
            $table->date('periode_start_date');
            $table->date('periode_end_date');
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->enum('status', [
                'draft',
                'submitted',
                'approved_by_principal',
                'approved_by_dirpen',
                'approved',
                'finalized',
                'rejected_by_principal',
                'rejected_by_dirpen',
                'rejected_by_director',
                'rejected'
            ])->default('draft');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('approved_by_principal')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_by_principal_at')->nullable();
            $table->foreignId('approved_by_dirpen')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_by_dirpen_at')->nullable();
            $table->foreignId('approved_by_director')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_by_director_at')->nullable();
            $table->timestamp('finalized_at')->nullable();
            $table->text('rejection_notes_principal')->nullable();
            $table->text('rejection_notes_dirpen')->nullable();
            $table->text('rejection_notes_director')->nullable();
            $table->timestamps();
            
            $table->index('status');
            $table->index('academic_year_id');
            $table->index('unit_kerja_id');
            $table->index('periode_start_date');
            $table->index('periode_end_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lpjs');
    }
};
