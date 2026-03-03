import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useTheme } from '@/context/ThemeContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function PackagesEdit({ package: pkg }) {
    const { auth } = usePage().props;
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const user = auth.user;
    const isAdmin = user?.is_admin || false;

    // Form state - initialize with package data
    const [values, setValues] = useState({
        name: pkg.name || '',
        slug: pkg.slug || '',
        description: pkg.description || '',
        package_type: pkg.package_type || 'basic',
        no_of_projects: pkg.no_of_projects || 5,
        no_of_tasks_per_project: pkg.no_of_tasks_per_project || 50,
        total_tasks_allowed: pkg.total_tasks_allowed || 250,
        no_of_team_members: pkg.no_of_team_members || 3,
        no_of_clients: pkg.no_of_clients || 5,
        has_time_tracking: pkg.has_time_tracking || false,
        has_deadline_management: pkg.has_deadline_management || true,
        has_efficiency_tracking: pkg.has_efficiency_tracking || false,
        has_reminders: pkg.has_reminders || true,
        has_kpi_tracking: pkg.has_kpi_tracking || false,
        kpi_points_per_task: pkg.kpi_points_per_task || 0,
        kpi_metrics: pkg.kpi_metrics || null,
        has_priority_support: pkg.has_priority_support || false,
        has_api_access: pkg.has_api_access || false,
        has_advanced_reports: pkg.has_advanced_reports || false,
        has_custom_fields: pkg.has_custom_fields || false,
        has_file_attachments: pkg.has_file_attachments || true,
        storage_limit_mb: pkg.storage_limit_mb || 100,
        price_monthly: pkg.price_monthly || 0,
        price_yearly: pkg.price_yearly || 0,
        setup_fee: pkg.setup_fee || 0,
        is_free: pkg.is_free || false,
        has_trial: pkg.has_trial || false,
        trial_days: pkg.trial_days || 0,
        is_active: pkg.is_active || true,
        is_featured: pkg.is_featured || false,
        is_public: pkg.is_public || true,
        sort_order: pkg.sort_order || 0,
    });

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    // Handle input changes
    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Auto-generate slug from name
        if (name === 'name') {
            setValues(prev => ({
                ...prev,
                slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            }));
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Handle number inputs
    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: parseInt(value) || 0,
        }));
    };

    // Handle decimal inputs
    const handleDecimalChange = (e) => {
        const { name, value } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0,
        }));
    };

    // Handle free package toggle
    const handleFreeToggle = (e) => {
        const isFree = e.target.checked;
        setValues(prev => ({
            ...prev,
            is_free: isFree,
            price_monthly: isFree ? 0 : prev.price_monthly,
            price_yearly: isFree ? 0 : prev.price_yearly,
            setup_fee: isFree ? 0 : prev.setup_fee,
        }));
    };

    // Handle trial toggle
    const handleTrialToggle = (e) => {
        const hasTrial = e.target.checked;
        setValues(prev => ({
            ...prev,
            has_trial: hasTrial,
            trial_days: hasTrial ? prev.trial_days : 0,
        }));
    };

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.put(route('packages.update', pkg.id), values, {
            onSuccess: () => {
                setProcessing(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
        });
    };

    // Theme classes
    const themeClasses = {
        // Backgrounds
        pageBg: isDark ? 'bg-[#0d0e14]' : 'bg-gray-50',

        // Cards
        card: isDark ? 'bg-[#12131a] border-white/[0.06]' : 'bg-white border-gray-200',
        cardHover: isDark ? 'hover:border-white/[0.10] hover:bg-[#141520]' : 'hover:border-gray-300 hover:shadow-sm',

        // Borders & Dividers
        borderBottom: isDark ? 'border-white/[0.06]' : 'border-gray-200',
        divide: isDark ? 'divide-white/[0.04]' : 'divide-gray-100',

        // Text colors
        heading: isDark ? 'text-white/90' : 'text-gray-900',
        subheading: isDark ? 'text-slate-600' : 'text-gray-400',
        body: isDark ? 'text-white/85' : 'text-gray-900',
        muted: isDark ? 'text-slate-500' : 'text-gray-500',
        label: isDark ? 'text-slate-300' : 'text-gray-700',

        // Interactive states
        rowHover: isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50',

        // Inputs
        input: isDark ? 'bg-white/[0.03] border-white/[0.07] text-white/85 placeholder:text-slate-700 focus:border-violet-500/50 focus:bg-violet-500/[0.04]' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:ring-0',
        inputError: isDark ? 'border-rose-500/50 focus:border-rose-500' : 'border-rose-300 focus:border-rose-500',
        checkbox: isDark ? 'bg-white/[0.03] border-white/[0.07] text-violet-500 focus:ring-violet-500/30' : 'bg-white border-gray-300 text-violet-600 focus:ring-violet-500',

        // Badge colors
        badgeActive: isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-100 text-emerald-700 border-emerald-200',
        badgeInactive: isDark ? 'bg-slate-400/10 text-slate-400 border-slate-400/20' : 'bg-gray-100 text-gray-600 border-gray-200',

        // Button styles
        buttonPrimary: isDark ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white',
        buttonSecondary: isDark ? 'bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 border-white/[0.08]' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200',
        buttonDanger: isDark ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20' : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200',

        // Header specific
        headerTitle: isDark ? 'text-white/90' : 'text-gray-900',
        headerSub: isDark ? 'text-slate-500' : 'text-gray-400',

        // Welcome banner specific
        welcomeGreet: isDark ? 'text-violet-400/70' : 'text-violet-600',
        welcomeTitle: isDark ? 'text-white/90' : 'text-gray-900',
        welcomeName: isDark ? 'text-violet-400' : 'text-violet-600',
        welcomeDesc: isDark ? 'text-slate-500' : 'text-gray-500',
    };

    // Package type options
    const packageTypes = [
        { value: 'free', label: 'Free' },
        { value: 'basic', label: 'Basic' },
        { value: 'premium', label: 'Premium' },
        { value: 'enterprise', label: 'Enterprise' },
        { value: 'custom', label: 'Custom' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className={`w-0.5 h-5 rounded-full ${isDark ? 'bg-violet-500' : 'bg-violet-600'}`} />
                    <div>
                        <h2 className={`text-[13.5px] font-semibold leading-tight tracking-wide ${themeClasses.headerTitle}`}>
                            Edit Package
                        </h2>
                        <p className={`text-[11px] font-light tracking-widest uppercase mt-0.5 ${themeClasses.headerSub}`}>
                            {pkg.name}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Edit Package: ${pkg.name}`} />

            <div className={`min-h-screen transition-colors duration-300 ${themeClasses.pageBg}`}>
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Success Message */}
                    {usePage().props.flash?.success && (
                        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
                            {usePage().props.flash.success}
                        </div>
                    )}

                    {/* ── Welcome Banner ── */}
                    <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 mb-6 ${themeClasses.card}`}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
                        <div className="absolute top-0 right-0 w-96 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative px-6 sm:px-8 py-7">
                            <div className="flex items-center gap-3 mb-3">
                                <Link
                                    href={route('packages.show', pkg.id)}
                                    className={`p-2 rounded-lg transition-colors ${themeClasses.buttonSecondary}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </Link>
                                <div>
                                    <p className={`text-[10px] font-bold tracking-[0.35em] uppercase ${themeClasses.welcomeGreet}`}>
                                        Edit Package
                                    </p>
                                    <h1 className={`text-xl sm:text-2xl font-semibold tracking-tight leading-snug ${themeClasses.welcomeTitle}`}>
                                        Editing <span className={themeClasses.welcomeName}>{pkg.name}</span>
                                    </h1>
                                </div>
                            </div>
                            <p className={`text-sm font-light leading-relaxed max-w-2xl ${themeClasses.welcomeDesc}`}>
                                Update package details, limits, features, and pricing.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                            <div className={`px-6 py-4 border-b flex items-center gap-3 ${themeClasses.borderBottom}`}>
                                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Basic Information</h3>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Name and Slug */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={`block text-[12px] font-medium mb-2 ${themeClasses.label}`}>
                                            Package Name <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={values.name}
                                            onChange={handleChange}
                                            className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${
                                                errors.name ? themeClasses.inputError : themeClasses.input
                                            }`}
                                            placeholder="e.g., Pro Monthly"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-[11px] text-rose-400">{errors.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className={`block text-[12px] font-medium mb-2 ${themeClasses.label}`}>
                                            Slug
                                        </label>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={values.slug}
                                            onChange={handleChange}
                                            className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${themeClasses.input}`}
                                            placeholder="pro-monthly"
                                        />
                                        <p className="mt-1 text-[10px] font-light text-slate-500">
                                            Auto-generated from name
                                        </p>
                                        {errors.slug && (
                                            <p className="mt-1 text-[11px] text-rose-400">{errors.slug}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className={`block text-[12px] font-medium mb-2 ${themeClasses.label}`}>
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={values.description}
                                        onChange={handleChange}
                                        rows="3"
                                        className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${themeClasses.input}`}
                                        placeholder="Describe what this package offers..."
                                    />
                                </div>

                                {/* Package Type */}
                                <div>
                                    <label className={`block text-[12px] font-medium mb-2 ${themeClasses.label}`}>
                                        Package Type <span className="text-rose-400">*</span>
                                    </label>
                                    <select
                                        name="package_type"
                                        value={values.package_type}
                                        onChange={handleChange}
                                        className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${themeClasses.input}`}
                                    >
                                        {packageTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.package_type && (
                                        <p className="mt-1 text-[11px] text-rose-400">{errors.package_type}</p>
                                    )}
                                </div>

                                {/* Sort Order */}
                                <div>
                                    <label className={`block text-[12px] font-medium mb-2 ${themeClasses.label}`}>
                                        Sort Order
                                    </label>
                                    <input
                                        type="number"
                                        name="sort_order"
                                        value={values.sort_order}
                                        onChange={handleNumberChange}
                                        min="0"
                                        className={`w-full md:w-32 rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${themeClasses.input}`}
                                    />
                                    <p className="mt-1 text-[10px] font-light text-slate-500">
                                        Lower numbers appear first
                                    </p>
                                    {errors.sort_order && (
                                        <p className="mt-1 text-[11px] text-rose-400">{errors.sort_order}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Limits & Quotas */}
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                            <div className={`px-6 py-4 border-b flex items-center gap-3 ${themeClasses.borderBottom}`}>
                                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Limits & Quotas</h3>
                                <p className={`text-[11px] font-light ml-auto ${themeClasses.muted}`}>
                                    0 = Unlimited
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {/* Projects */}
                                    <div>
                                        <label className={`block text-[12px] font-medium mb-2 ${themeClasses.label}`}>
                                            Number of Projects
                                        </label>
                                        <input
                                            type="number"
                                            name="no_of_projects"
                                            value={values.no_of_projects}
                                            onChange={handleNumberChange}
                                            min="0"
                                            className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${themeClasses.input}`}
                                        />
                                        {errors.no_of_projects && (
                                            <p className="mt-1 text-[11px] text-rose-400">{errors.no_of_projects}</p>
                                        )}
                                    </div>

                                    {/* Tasks per Project */}
                                    <div>
                                        <label className={`block text-[12px] font-medium mb-2 ${themeClasses.label}`}>
                                            Tasks per Project
                                        </label>
                                        <input
                                            type="number"
                                            name="no_of_tasks_per_project"
                                            value={values.no_of_tasks_per_project}
                                            onChange={handleNumberChange}
                                            min="0"
                                            className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${themeClasses.input}`}
                                        />
                                        {errors.no_of_tasks_per_project && (
                                            <p className="mt-1 text-[11px] text-rose-400">{errors.no_of_tasks_per_project}</p>
                                        )}
                                    </div>

                                    {/* Total Tasks */}
                                    <div>
                                        <label className={`block text-[12px] font-medium mb-2 ${themeClasses.label}`}>
                                            Total Tasks Allowed
                                        </label>
                                        <input
                                            type="number"
                                            name="total_tasks_allowed"
                                            value={values.total_tasks_allowed}
                                            onChange={handleNumberChange}
                                            min="0"
                                            className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${themeClasses.input}`}
                                        />
                                        {errors.total_tasks_allowed && (
                                            <p className="mt-1 text-[11px] text-rose-400">{errors.total_tasks_allowed}</p>
                                        )}
                                    </div>

                                    {/* Team Members */}
                                    <div>
                                        <label className={`block text-[12px] font-medium mb-2 ${themeClasses.label}`}>
                                            Team Members
                                        </label>
                                        <input
                                            type="number"
                                            name="no_of_team_members"
                                            value={values.no_of_team_members}
                                            onChange={handleNumberChange}
                                            min="1"
                                            className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${themeClasses.input}`}
                                        />
                                        {errors.no_of_team_members && (
                                            <p className="mt-1 text-[11px] text-rose-400">{errors.no_of_team_members}</p>
                                        )}
                                    </div>

                                    {/* Clients */}
                                    <div>
                                        <label className={`block text-[12px] font-medium mb-2 ${themeClasses.label}`}>
                                            Number of Clients
                                        </label>
                                        <input
                                            type="number"
                                            name="no_of_clients"
                                            value={values.no_of_clients}
                                            onChange={handleNumberChange}
                                            min="0"
                                            className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${themeClasses.input}`}
                                        />
                                        {errors.no_of_clients && (
                                            <p className="mt-1 text-[11px] text-rose-400">{errors.no_of_clients}</p>
                                        )}
                                    </div>

                                    {/* Storage Limit */}
                                    <div>
                                        <label className={`block text-[12px] font-medium mb-2 ${themeClasses.label}`}>
                                            Storage Limit (MB)
                                        </label>
                                        <input
                                            type="number"
                                            name="storage_limit_mb"
                                            value={values.storage_limit_mb}
                                            onChange={handleNumberChange}
                                            min="0"
                                            className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${themeClasses.input}`}
                                        />
                                        {errors.storage_limit_mb && (
                                            <p className="mt-1 text-[11px] text-rose-400">{errors.storage_limit_mb}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                            <div className={`px-6 py-4 border-b flex items-center gap-3 ${themeClasses.borderBottom}`}>
                                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Features</h3>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Time Management Features */}
                                    <div className="space-y-3">
                                        <p className={`text-[11px] font-semibold uppercase tracking-wider ${themeClasses.subheading}`}>Time Management</p>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="has_time_tracking"
                                                    checked={values.has_time_tracking}
                                                    onChange={handleChange}
                                                    className={`rounded ${themeClasses.checkbox}`}
                                                />
                                                <span className={`text-[13px] ${themeClasses.body}`}>Time Tracking</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="has_deadline_management"
                                                    checked={values.has_deadline_management}
                                                    onChange={handleChange}
                                                    className={`rounded ${themeClasses.checkbox}`}
                                                />
                                                <span className={`text-[13px] ${themeClasses.body}`}>Deadline Management</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="has_efficiency_tracking"
                                                    checked={values.has_efficiency_tracking}
                                                    onChange={handleChange}
                                                    className={`rounded ${themeClasses.checkbox}`}
                                                />
                                                <span className={`text-[13px] ${themeClasses.body}`}>Efficiency Tracking</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="has_reminders"
                                                    checked={values.has_reminders}
                                                    onChange={handleChange}
                                                    className={`rounded ${themeClasses.checkbox}`}
                                                />
                                                <span className={`text-[13px] ${themeClasses.body}`}>Reminders</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* KPI Features */}
                                    <div className="space-y-3">
                                        <p className={`text-[11px] font-semibold uppercase tracking-wider ${themeClasses.subheading}`}>KPI & Performance</p>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="has_kpi_tracking"
                                                    checked={values.has_kpi_tracking}
                                                    onChange={handleChange}
                                                    className={`rounded ${themeClasses.checkbox}`}
                                                />
                                                <span className={`text-[13px] ${themeClasses.body}`}>KPI Tracking</span>
                                            </label>
                                            {values.has_kpi_tracking && (
                                                <div className="ml-6 mt-2">
                                                    <input
                                                        type="number"
                                                        name="kpi_points_per_task"
                                                        value={values.kpi_points_per_task}
                                                        onChange={handleNumberChange}
                                                        min="0"
                                                        placeholder="Points per task"
                                                        className={`w-full rounded-lg px-3 py-1.5 text-[12px] border transition-all duration-200 ${themeClasses.input}`}
                                                    />
                                                    {errors.kpi_points_per_task && (
                                                        <p className="mt-1 text-[11px] text-rose-400">{errors.kpi_points_per_task}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Advanced Features */}
                                    <div className="space-y-3">
                                        <p className={`text-[11px] font-semibold uppercase tracking-wider ${themeClasses.subheading}`}>Advanced</p>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="has_priority_support"
                                                    checked={values.has_priority_support}
                                                    onChange={handleChange}
                                                    className={`rounded ${themeClasses.checkbox}`}
                                                />
                                                <span className={`text-[13px] ${themeClasses.body}`}>Priority Support</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="has_api_access"
                                                    checked={values.has_api_access}
                                                    onChange={handleChange}
                                                    className={`rounded ${themeClasses.checkbox}`}
                                                />
                                                <span className={`text-[13px] ${themeClasses.body}`}>API Access</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="has_advanced_reports"
                                                    checked={values.has_advanced_reports}
                                                    onChange={handleChange}
                                                    className={`rounded ${themeClasses.checkbox}`}
                                                />
                                                <span className={`text-[13px] ${themeClasses.body}`}>Advanced Reports</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="has_custom_fields"
                                                    checked={values.has_custom_fields}
                                                    onChange={handleChange}
                                                    className={`rounded ${themeClasses.checkbox}`}
                                                />
                                                <span className={`text-[13px] ${themeClasses.body}`}>Custom Fields</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="has_file_attachments"
                                                    checked={values.has_file_attachments}
                                                    onChange={handleChange}
                                                    className={`rounded ${themeClasses.checkbox}`}
                                                />
                                                <span className={`text-[13px] ${themeClasses.body}`}>File Attachments</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                            <div className={`px-6 py-4 border-b flex items-center gap-3 ${themeClasses.borderBottom}`}>
                                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Pricing</h3>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Free Package Toggle */}
                                <div className="flex items-center gap-3 pb-4 border-b border-dashed">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="is_free"
                                            checked={values.is_free}
                                            onChange={handleFreeToggle}
                                            className={`rounded ${themeClasses.checkbox}`}
                                        />
                                        <span className={`text-[13px] font-medium ${themeClasses.body}`}>This is a free package</span>
                                    </label>
                                </div>

                                {!values.is_free && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                            {/* Monthly Price */}
                                            <div>
                                                <label className={`block text-[12px] font-medium mb-2 ${themeClasses.label}`}>
                                                    Monthly Price (₹)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="price_monthly"
                                                    value={values.price_monthly}
                                                    onChange={handleDecimalChange}
                                                    min="0"
                                                    step="0.01"
                                                    className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${themeClasses.input}`}
                                                />
                                                {errors.price_monthly && (
                                                    <p className="mt-1 text-[11px] text-rose-400">{errors.price_monthly}</p>
                                                )}
                                            </div>

                                            {/* Yearly Price */}
                                            <div>
                                                <label className={`block text-[12px] font-medium mb-2 ${themeClasses.label}`}>
                                                    Yearly Price (₹)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="price_yearly"
                                                    value={values.price_yearly}
                                                    onChange={handleDecimalChange}
                                                    min="0"
                                                    step="0.01"
                                                    className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${themeClasses.input}`}
                                                />
                                                {errors.price_yearly && (
                                                    <p className="mt-1 text-[11px] text-rose-400">{errors.price_yearly}</p>
                                                )}
                                            </div>

                                            {/* Setup Fee */}
                                            <div>
                                                <label className={`block text-[12px] font-medium mb-2 ${themeClasses.label}`}>
                                                    Setup Fee (₹)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="setup_fee"
                                                    value={values.setup_fee}
                                                    onChange={handleDecimalChange}
                                                    min="0"
                                                    step="0.01"
                                                    className={`w-full rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${themeClasses.input}`}
                                                />
                                                {errors.setup_fee && (
                                                    <p className="mt-1 text-[11px] text-rose-400">{errors.setup_fee}</p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Trial Period */}
                                <div className="pt-4 border-t border-dashed">
                                    <div className="flex items-center gap-3 mb-3">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="has_trial"
                                                checked={values.has_trial}
                                                onChange={handleTrialToggle}
                                                className={`rounded ${themeClasses.checkbox}`}
                                            />
                                            <span className={`text-[13px] font-medium ${themeClasses.body}`}>Has Trial Period</span>
                                        </label>
                                    </div>

                                    {values.has_trial && (
                                        <div className="ml-6">
                                            <label className={`block text-[12px] font-medium mb-2 ${themeClasses.label}`}>
                                                Trial Days
                                            </label>
                                            <input
                                                type="number"
                                                name="trial_days"
                                                value={values.trial_days}
                                                onChange={handleNumberChange}
                                                min="1"
                                                max="365"
                                                className={`w-full md:w-32 rounded-lg px-4 py-2.5 text-[13px] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${themeClasses.input}`}
                                            />
                                            {errors.trial_days && (
                                                <p className="mt-1 text-[11px] text-rose-400">{errors.trial_days}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Status & Visibility */}
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                            <div className={`px-6 py-4 border-b flex items-center gap-3 ${themeClasses.borderBottom}`}>
                                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className={`text-[13px] font-semibold ${themeClasses.heading}`}>Status & Visibility</h3>
                            </div>

                            <div className="p-6">
                                <div className="flex flex-wrap gap-6">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={values.is_active}
                                            onChange={handleChange}
                                            className={`rounded ${themeClasses.checkbox}`}
                                        />
                                        <span className={`text-[13px] ${themeClasses.body}`}>Active (available for purchase)</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="is_featured"
                                            checked={values.is_featured}
                                            onChange={handleChange}
                                            className={`rounded ${themeClasses.checkbox}`}
                                        />
                                        <span className={`text-[13px] ${themeClasses.body}`}>Featured (highlighted)</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="is_public"
                                            checked={values.is_public}
                                            onChange={handleChange}
                                            className={`rounded ${themeClasses.checkbox}`}
                                        />
                                        <span className={`text-[13px] ${themeClasses.body}`}>Public (visible to users)</span>
                                    </label>
                                </div>
                                {errors.is_active && (
                                    <p className="mt-2 text-[11px] text-rose-400">{errors.is_active}</p>
                                )}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end gap-3">
                            <Link
                                href={route('packages.show', pkg.id)}
                                className={`px-6 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 border ${themeClasses.buttonSecondary}`}
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`px-6 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 bg-gradient-to-br from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white shadow-lg shadow-violet-900/40 ring-1 ring-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                            >
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span>Update Package</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
