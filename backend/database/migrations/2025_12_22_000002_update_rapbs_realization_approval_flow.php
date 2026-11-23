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
        // Update status enum untuk mengikuti alur Rencana RAPBS
        DB::statement("ALTER TABLE rapbs_realizations MODIFY COLUMN status ENUM(
            'pending',
            'submitted',
            'approved_by_principal',
            'approved_by_dirpen',
            'approved',
            'rejected_by_principal',
            'rejected_by_dirpen',
            'rejected_by_director',
            'rejected'
        ) DEFAULT 'pending'");

        Schema::table('rapbs_realizations', function (Blueprint $table) {
            // Hapus kolom manager approval (tidak digunakan lagi)
            if (Schema::hasColumn('rapbs_realizations', 'approved_by_manager')) {
                $table->dropForeign(['approved_by_manager']);
                $table->dropColumn([
                    'approved_by_manager',
                    'approved_by_manager_at',
                    'rejection_notes_manager',
                ]);
            }

            // Tambah kolom dirpen approval (Level 2)
            if (!Schema::hasColumn('rapbs_realizations', 'approved_by_dirpen')) {
                $table->foreignId('approved_by_dirpen')->nullable()->after('approved_by_principal_at')->constrained('users')->onDelete('set null');
                $table->timestamp('approved_by_dirpen_at')->nullable()->after('approved_by_dirpen');
                $table->text('rejection_notes_dirpen')->nullable()->after('approved_by_dirpen_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rapbs_realizations', function (Blueprint $table) {
            // Hapus kolom dirpen
            if (Schema::hasColumn('rapbs_realizations', 'approved_by_dirpen')) {
                $table->dropForeign(['approved_by_dirpen']);
                $table->dropColumn([
                    'approved_by_dirpen',
                    'approved_by_dirpen_at',
                    'rejection_notes_dirpen',
                ]);
            }

            // Kembalikan kolom manager
            if (!Schema::hasColumn('rapbs_realizations', 'approved_by_manager')) {
                $table->foreignId('approved_by_manager')->nullable()->after('approved_at')->constrained('users')->onDelete('set null');
                $table->timestamp('approved_by_manager_at')->nullable()->after('approved_by_manager');
                $table->text('rejection_notes_manager')->nullable()->after('approved_by_manager_at');
            }
        });

        // Revert status enum
        DB::statement("ALTER TABLE rapbs_realizations MODIFY COLUMN status ENUM(
            'pending',
            'submitted',
            'approved_by_manager',
            'approved_by_principal',
            'approved',
            'rejected_by_manager',
            'rejected_by_principal',
            'rejected_by_director',
            'rejected'
        ) DEFAULT 'pending'");
    }
};

