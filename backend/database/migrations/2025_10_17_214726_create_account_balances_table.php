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
        Schema::create('account_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained('chart_of_accounts')->onDelete('cascade');
            $table->integer('period_year');
            $table->integer('period_month');
            $table->decimal('opening_debit', 15, 2)->default(0);
            $table->decimal('opening_credit', 15, 2)->default(0);
            $table->decimal('period_debit', 15, 2)->default(0);
            $table->decimal('period_credit', 15, 2)->default(0);
            $table->decimal('closing_debit', 15, 2)->default(0);
            $table->decimal('closing_credit', 15, 2)->default(0);
            $table->timestamps();
            $table->unique(['account_id', 'period_year', 'period_month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('account_balances');
    }
};
