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
        Schema::create('packages', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            $table->string('package_type');

            $table->integer('no_of_projects')->default(0)->comment('Number of projects allowed (0 = unlimited)');
            $table->integer('no_of_tasks_per_project')->default(0)->comment('Number of tasks per project (0 = unlimited)');
            $table->integer('total_tasks_allowed')->default(0)->comment('Total tasks across all projects (0 = unlimited)');

            $table->integer('no_of_team_members')->default(1)->comment('Number of team members allowed');
            $table->integer('no_of_clients')->default(0)->comment('Number of clients allowed (0 = unlimited)');

            $table->boolean('has_time_tracking')->default(false)->comment('Enable time tracking feature');
            $table->boolean('has_deadline_management')->default(false)->comment('Enable deadline management');
            $table->boolean('has_efficiency_tracking')->default(false)->comment('Enable efficiency tracking');
            $table->boolean('has_reminders')->default(false)->comment('Enable reminder notifications');

            $table->boolean('has_kpi_tracking')->default(false)->comment('Enable KPI tracking');
            $table->integer('kpi_points_per_task')->default(0)->comment('KPI points earned per task completion');
            $table->json('kpi_metrics')->nullable()->comment('Additional KPI metrics configuration');

            $table->boolean('has_priority_support')->default(false)->comment('Priority customer support');
            $table->boolean('has_api_access')->default(false)->comment('API access enabled');
            $table->boolean('has_advanced_reports')->default(false)->comment('Advanced reporting features');
            $table->boolean('has_custom_fields')->default(false)->comment('Custom fields support');
            $table->boolean('has_file_attachments')->default(false)->comment('File attachment support');
            $table->integer('storage_limit_mb')->default(100)->comment('Storage limit in MB');

            $table->decimal('price_monthly', 10, 2)->default(0)->comment('Monthly price');
            $table->decimal('price_yearly', 10, 2)->default(0)->comment('Yearly price (usually discounted)');
            $table->decimal('setup_fee', 10, 2)->default(0)->comment('One-time setup fee');
            $table->boolean('is_free')->default(false)->comment('Is this a free package?');
            $table->boolean('has_trial')->default(false)->comment('Has trial period');
            $table->integer('trial_days')->default(0)->comment('Number of trial days');

            $table->boolean('is_active')->default(true)->comment('Package is available for purchase');
            $table->boolean('is_featured')->default(false)->comment('Featured package');
            $table->boolean('is_public')->default(true)->comment('Visible to users');
            $table->integer('sort_order')->default(0)->comment('Display order');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
