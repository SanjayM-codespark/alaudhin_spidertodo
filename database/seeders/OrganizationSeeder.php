<?php

namespace Database\Seeders;

use App\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrganizationSeeder extends Seeder
{
    public function run(): void
    {
        // Create a specific test organization
        Organization::create([
            'name' => 'Acme Corporation',
            'slug' => 'acme-corporation-' . rand(1000, 9999),
            'description' => 'A leading provider of innovative solutions.',
            'email' => 'info@acme.com',
            'phone' => '+1-555-123-4567',
            'address_line1' => '123 Business Ave',
            'address_line2' => 'Suite 100',
            'city' => 'San Francisco',
            'state' => 'CA',
            'country' => 'USA',
            'postal_code' => '94105',
            'db_host' => 'localhost',
            'db_port' => '5432',
            'db_name' => 'acme_tenant',
            'db_username' => 'acme_user',
            'db_password' => bcrypt('secure_password'),
            'is_active' => true,
        ]);

        // Create a few more sample organizations
        $organizations = [
            [
                'name' => 'Tech Solutions Inc',
                'description' => 'IT consulting and software development',
                'email' => 'contact@techsolutions.com',
                'phone' => '+1-555-987-6543',
                'city' => 'New York',
                'state' => 'NY',
                'country' => 'USA',
                'db_name' => 'tech_tenant',
            ],
            [
                'name' => 'Global Logistics Co',
                'description' => 'Worldwide shipping and logistics',
                'email' => 'info@globallogistics.com',
                'phone' => '+44-20-1234-5678',
                'city' => 'London',
                'state' => 'England',
                'country' => 'UK',
                'db_name' => 'logistics_tenant',
            ],
            [
                'name' => 'HealthCare Plus',
                'description' => 'Medical services and healthcare solutions',
                'email' => 'contact@healthcareplus.com',
                'phone' => '+61-2-9876-5432',
                'city' => 'Sydney',
                'state' => 'NSW',
                'country' => 'Australia',
                'db_name' => 'healthcare_tenant',
            ],
        ];

        foreach ($organizations as $org) {
            Organization::create([
                'name' => $org['name'],
                'slug' => Str::slug($org['name']) . '-' . Str::random(6),
                'description' => $org['description'],
                'email' => $org['email'],
                'phone' => $org['phone'],
                'address_line1' => '123 Main St',
                'address_line2' => null,
                'city' => $org['city'],
                'state' => $org['state'],
                'country' => $org['country'],
                'postal_code' => '12345',
                'db_host' => 'localhost',
                'db_port' => '5432',
                'db_name' => $org['db_name'],
                'db_username' => 'tenant_user',
                'db_password' => bcrypt('password123'),
                'is_active' => true,
            ]);
        }
    }
}
