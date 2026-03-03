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
        Schema::create('memberships', function (Blueprint $table) {
            $table->id();

            // Foreign Keys
            $table->foreignId('organization_id')
                ->constrained('organizations')
                ->onDelete('cascade')
                ->comment('Reference to the organization');

            $table->foreignId('package_id')
                ->constrained('packages')
                ->onDelete('restrict')
                ->comment('Reference to the subscribed package');

            // Membership Period
            $table->timestamp('start_date')->nullable()->comment('When the membership starts/started');
            $table->timestamp('end_date')->nullable()->comment('When the membership ends (null = unlimited/lifetime)');

            // Trial Period
            $table->boolean('is_trial')->default(false)->comment('Whether this is a trial membership');
            $table->timestamp('trial_ends_at')->nullable()->comment('When the trial period ends');
            $table->integer('trial_days')->default(0)->comment('Number of trial days granted');

            // Billing Information
            $table->enum('billing_cycle', ['monthly', 'yearly', 'quarterly', 'lifetime'])->default('monthly')->comment('Billing cycle frequency');
            $table->decimal('price_paid', 10, 2)->default(0)->comment('Actual price paid for this membership');
            $table->decimal('discount_amount', 10, 2)->default(0)->comment('Discount applied if any');
            $table->string('coupon_code', 50)->nullable()->comment('Coupon code used if any');

            // Payment Status
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending')->comment('Payment status');
            $table->timestamp('paid_at')->nullable()->comment('When payment was completed');
            $table->string('transaction_id', 100)->nullable()->comment('Payment gateway transaction ID');
            $table->json('payment_details')->nullable()->comment('Additional payment details from gateway');

            // Membership Status
            $table->enum('status', [
                'active',           // Currently active
                'expired',          // End date passed
                'cancelled',        // Cancelled by user/admin
                'suspended',        // Temporarily suspended
                'trial',            // In trial period
                'pending_payment'   // Awaiting payment
            ])->default('pending_payment')->comment('Current membership status');

            $table->timestamp('cancelled_at')->nullable()->comment('When membership was cancelled');
            $table->text('cancellation_reason')->nullable()->comment('Reason for cancellation');

            // Auto-renewal
            $table->boolean('auto_renew')->default(true)->comment('Whether to auto-renew at end date');
            $table->integer('renewal_count')->default(0)->comment('Number of times renewed');
            $table->timestamp('next_billing_date')->nullable()->comment('Next scheduled billing date');

            // Usage & Limits Tracking (snapshot at time of subscription)
            $table->integer('allowed_projects')->default(0)->comment('Projects allowed (snapshot)');
            $table->integer('allowed_tasks_per_project')->default(0)->comment('Tasks per project allowed (snapshot)');
            $table->integer('allowed_total_tasks')->default(0)->comment('Total tasks allowed (snapshot)');
            $table->integer('allowed_team_members')->default(1)->comment('Team members allowed (snapshot)');
            $table->integer('allowed_clients')->default(0)->comment('Clients allowed (snapshot)');
            $table->integer('allowed_storage_mb')->default(100)->comment('Storage allowed in MB (snapshot)');

            // Feature Snapshot (JSON copy of package features at time of subscription)
            $table->json('feature_snapshot')->nullable()->comment('Snapshot of package features at subscription time');

            // Notes
            $table->text('notes')->nullable()->comment('Internal notes about this membership');

            // Soft deletes and timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes for better performance
            $table->index(['organization_id', 'status']);
            $table->index(['package_id', 'status']);
            $table->index('start_date');
            $table->index('end_date');
            $table->index('trial_ends_at');
            $table->index('next_billing_date');
            $table->index('status');

            // Composite indexes for common queries
            $table->index(['organization_id', 'status', 'end_date']);
            $table->index(['status', 'trial_ends_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('memberships');
    }
};
