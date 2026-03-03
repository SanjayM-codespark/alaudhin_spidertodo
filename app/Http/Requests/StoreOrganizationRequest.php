<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Add your authorization logic here
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address_line1' => 'nullable|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'db_host' => 'required|string|max:255',
            'db_port' => 'required|string|max:10',
            'db_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('organizations', 'db_name'),
            ],
            'db_username' => 'required|string|max:255',
            'db_password' => 'required|string|max:255',
            'is_active' => 'boolean',
        ];
    }
}
