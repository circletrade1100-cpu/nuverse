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
        Schema::table('rapbs_plans', function (Blueprint $table) {
            // Update status enum untuk multi-level approval
            // Note: MySQL doesn't support ALTER ENUM directly, so we'll use raw SQL
        });

        // Update status enum menggunakan raw SQL untuk MySQL
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

        Schema::table('rapbs_plans', function (Blueprint $table) {
            // Level 1: Manager approval
            $table->foreignId('approved_by_manager')->nullable()->after('approved_at')->constrained('users')->onDelete('set null');
            $table->timestamp('approved_by_manager_at')->nullable()->after('approved_by_manager');
            $table->text('rejection_notes_manager')->nullable()->after('approved_by_manager_at');

            // Level 2: Principal approval
            $table->foreignId('approved_by_principal')->nullable()->after('rejection_notes_manager')->constrained('users')->onDelete('set null');
            $table->timestamp('approved_by_principal_at')->nullable()->after('approved_by_principal');
            $table->text('rejection_notes_principal')->nullable()->after('approved_by_principal_at');

            // Level 3: Director approval (final)
            $table->foreignId('approved_by_director')->nullable()->after('rejection_notes_principal')->constrained('users')->onDelete('set null');
            $table->timestamp('approved_by_director_at')->nullable()->after('approved_by_director');
            $table->text('rejection_notes_director')->nullable()->after('approved_by_director_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rapbs_plans', function (Blueprint $table) {
            // Drop columns
            $table->dropForeign(['approved_by_manager']);
            $table->dropForeign(['approved_by_principal']);
            $table->dropForeign(['approved_by_director']);
            
            $table->dropColumn([
                'approved_by_manager',
                'approved_by_manager_at',
                'rejection_notes_manager',
                'approved_by_principal',
                'approved_by_principal_at',
                'rejection_notes_principal',
                'approved_by_director',
                'approved_by_director_at',
                'rejection_notes_director',
            ]);
        });

        // Revert status enum
        DB::statement("ALTER TABLE rapbs_plans MODIFY COLUMN status ENUM(
            'draft',
            'submitted',
            'approved',
            'rejected'
        ) DEFAULT 'draft'");
    }
};

