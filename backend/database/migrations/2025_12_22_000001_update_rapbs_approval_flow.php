<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update status enum: hapus approved_by_manager, tambah approved_by_dirpen
        DB::statement("ALTER TABLE rapbs_plans MODIFY COLUMN status ENUM(
            'draft',
            'submitted',
            'approved_by_principal',
            'approved_by_dirpen',
            'approved',
            'rejected_by_principal',
            'rejected_by_dirpen',
            'rejected_by_director',
            'rejected'
        ) DEFAULT 'draft'");

        Schema::table('rapbs_plans', function (Blueprint $table) {
            // Hapus manager approval fields
            $table->dropForeign(['approved_by_manager']);
            $table->dropColumn([
                'approved_by_manager',
                'approved_by_manager_at',
                'rejection_notes_manager',
            ]);

            // Tambah Dirpen approval fields (Level 2)
            $table->foreignId('approved_by_dirpen')->nullable()->after('rejection_notes_principal')->constrained('users')->onDelete('set null');
            $table->timestamp('approved_by_dirpen_at')->nullable()->after('approved_by_dirpen');
            $table->text('rejection_notes_dirpen')->nullable()->after('approved_by_dirpen_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rapbs_plans', function (Blueprint $table) {
            // Hapus dirpen fields
            $table->dropForeign(['approved_by_dirpen']);
            $table->dropColumn([
                'approved_by_dirpen',
                'approved_by_dirpen_at',
                'rejection_notes_dirpen',
            ]);

            // Kembalikan manager fields
            $table->foreignId('approved_by_manager')->nullable()->after('approved_at')->constrained('users')->onDelete('set null');
            $table->timestamp('approved_by_manager_at')->nullable()->after('approved_by_manager');
            $table->text('rejection_notes_manager')->nullable()->after('approved_by_manager_at');
        });

        // Revert status enum
        DB::statement("ALTER TABLE rapbs_plans MODIFY COLUMN status ENUM(
            'draft',
            'submitted',
            'approved_by_manager',
            'approved_by_principal',
            'approved',
            'rejected_by_manager',
            'rejected_by_principal',
            'rejected_by_director',
            'rejected'
        ) DEFAULT 'draft'");
    }
};

