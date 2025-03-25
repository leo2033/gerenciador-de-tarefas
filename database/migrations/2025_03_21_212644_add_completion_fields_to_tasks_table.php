<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCompletionFieldsToTasksTable extends Migration
{
    public function up()
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->boolean('completion_request')->default(false);
            $table->text('completion_comment')->nullable();
            $table->enum('status', ['pendente', 'concluida'])->default('pendente');
            $table->text('admin_comment')->nullable();
        });
    }

    public function down()
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn([
                'completion_request',
                'completion_comment',
                'status',
                'admin_comment'
            ]);
        });
    }
}
