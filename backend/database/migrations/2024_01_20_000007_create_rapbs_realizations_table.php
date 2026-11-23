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
        Schema::create('rapbs_realizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rapbs_plan_id')->constrained('rapbs_plans')->onDelete('cascade');
            $table->date('transaction_date');
            $table->decimal('amount', 15, 2);
            $table->text('description');
            $table->string('vendor_name', 200);
            $table->enum('payment_method', ['cash', 'transfer', 'check']);
            $table->string('reference_number', 100)->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            
            $table->index('rapbs_plan_id');
            $table->index('transaction_date');
            $table->index('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rapbs_realizations');
    }
};

