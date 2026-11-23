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
        // Add realized_amount to rapbs_plans
        Schema::table('rapbs_plans', function (Blueprint $table) {
            $table->decimal('realized_amount', 15, 2)->default(0)->after('planned_amount');
        });

        // Add status and approval fields to rapbs_realizations
        Schema::table('rapbs_realizations', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->after('created_by');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null')->after('status');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->text('approval_notes')->nullable()->after('approved_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rapbs_plans', function (Blueprint $table) {
            $table->dropColumn('realized_amount');
        });

        Schema::table('rapbs_realizations', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['status', 'approved_by', 'approved_at', 'approval_notes']);
        });
    }
};
