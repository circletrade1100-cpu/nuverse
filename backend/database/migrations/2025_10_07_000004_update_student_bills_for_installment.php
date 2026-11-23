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
        Schema::table('student_bills', function (Blueprint $table) {
            $table->integer('installment_count')->default(0)->after('allow_installment')
                ->comment('Jumlah cicilan yang sudah dibayar');
            $table->decimal('min_installment_amount', 15, 2)->nullable()->after('installment_count')
                ->comment('Minimal bayar per cicilan (opsional)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_bills', function (Blueprint $table) {
            $table->dropColumn(['installment_count', 'min_installment_amount']);
        });
    }
};

