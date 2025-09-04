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
        //должность, отдел, ФИО, телефон, др, 
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string("position");
            $table->string("department");
            $table->string("DOB");
            $table->string("name");
            $table->string("phone");
            $table->timestamps();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
