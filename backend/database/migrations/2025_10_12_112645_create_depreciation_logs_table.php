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
        Schema::create('depreciation_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->date('depreciation_date');
            $table->decimal('depreciation_amount', 15, 2);
            $table->decimal('current_value', 15, 2);
            $table->decimal('previous_value', 15, 2);
            $table->enum('method', ['straight_line', 'declining_balance', 'units_of_production']);
            $table->decimal('depreciation_rate', 5, 2)->nullable(); // Percentage
            $table->integer('useful_life_years')->nullable(); // Years
            $table->decimal('salvage_value', 15, 2)->default(0); // Nilai sisa
            $table->text('notes')->nullable();
            $table->foreignId('calculated_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Indexes
            $table->index(['item_id', 'depreciation_date']);
            $table->index('depreciation_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('depreciation_logs');
    }
};