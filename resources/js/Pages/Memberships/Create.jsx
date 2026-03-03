import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function MembershipsCreate({ organizations, packages, selectedOrganization }) {
    const { auth } = usePage().props;
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const user = auth.user;
    const userRole = user?.role_type;
    const isAdmin = user.is_admin || false;

    const [selectedPackage, setSelectedPackage] = useState(null);
    const [showTrialFields, setShowTrialFields] = useState(false);
    const [showDiscountFields, setShowDiscountFields] = useState(false);
    const [calculatedEndDate, setCalculatedEndDate] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        organization_id: selectedOrganization?.id || '',
        package_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        is_trial: false,
        trial_ends_at: '',
        trial_days: 0,
        billing_cycle: 'monthly',
        price_paid: '',
        discount_amount: 0,
        coupon_code: '',
        payment_status: 'pending',
        paid_at: '',
        transaction_id: '',
        payment_details: {},
        status: 'pending_payment',
        auto_renew: true,
        next_billing_date: '',
        notes: '',

        // These will be set by the controller from the package
        // but we need to ensure they're not null in the request
        allowed_projects: 0,
        allowed_tasks_per_project: 0,
        allowed_total_tasks: 0,
        allowed_team_members: 1,
        allowed_clients: 0,
        allowed_storage_mb: 100,
        feature_snapshot: {},
    });

    // Update when package changes
    useEffect(() => {
        if (data.package_id) {
            const pkg = packages.find(p => p.id === parseInt(data.package_id));
            setSelectedPackage(pkg);

            // Set default price based on billing cycle
            if (pkg) {
                const price = pkg[`price_${data.billing_cycle}`] || 0;
                setData('price_paid', price);

                // Calculate end date
                calculateEndDate(data.billing_cycle, data.start_date);
            }
        }
    }, [data.package_id, data.billing_cycle]);

    // Calculate end date based on billing cycle
    const calculateEndDate = (cycle, startDate) => {
        if (!startDate || cycle === 'lifetime') {
            setCalculatedEndDate(null);
            setData('end_date', '');
            setData('next_billing_date', '');
            return;
        }

        const start = new Date(startDate);
        let end = new Date(start);

        switch(cycle) {
            case 'monthly':
                end.setMonth(end.getMonth() + 1);
                break;
            case 'quarterly':
                end.setMonth(end.getMonth() + 3);
                break;
            case 'yearly':
                end.setFullYear(end.getFullYear() + 1);
                break;
            default:
                end = null;
        }

        if (end) {
            const endStr = end.toISOString().split('T')[0];
            setCalculatedEndDate(endStr);
            setData('end_date', endStr);

            // Set next billing date
            if (data.auto_renew && cycle !== 'lifetime') {
                setData('next_billing_date', endStr);
            }
        }
    };

    // Handle start date change
    const handleStartDateChange = (e) => {
        const startDate = e.target.value;
        setData('start_date', startDate);
        calculateEndDate(data.billing_cycle, startDate);
    };

    // Handle billing cycle change
    const handleBillingCycleChange = (e) => {
        const cycle = e.target.value;
        setData('billing_cycle', cycle);

        // Update price
        if (selectedPackage) {
            const price = selectedPackage[`price_${cycle}`] || 0;
            setData('price_paid', price);
        }

        // Update end date
        calculateEndDate(cycle, data.start_date);
    };

    // Handle trial toggle
    const handleTrialToggle = (e) => {
        const isTrial = e.target.checked;
        setShowTrialFields(isTrial);
        setData('is_trial', isTrial);

        if (isTrial) {
            const trialDays = selectedPackage?.trial_days || 14;
            setData('trial_days', trialDays);

            const trialEnd = new Date(data.start_date);
            trialEnd.setDate(trialEnd.getDate() + trialDays);
            setData('trial_ends_at', trialEnd.toISOString().split('T')[0]);
            setData('status', 'trial');
        } else {
            setData('trial_days', 0);
            setData('trial_ends_at', '');
            setData('status', data.payment_status === 'paid' ? 'active' : 'pending_payment');
        }
    };

    // Handle auto renew toggle
    const handleAutoRenewToggle = (e) => {
        const autoRenew = e.target.checked;
        setData('auto_renew', autoRenew);

        if (autoRenew && data.billing_cycle !== 'lifetime' && calculatedEndDate) {
            setData('next_billing_date', calculatedEndDate);
        } else {
            setData('next_billing_date', '');
        }
    };

    // Handle payment status change
    const handlePaymentStatusChange = (e) => {
        const status = e.target.value;
        setData('payment_status', status);

        if (status === 'paid') {
            setData('paid_at', new Date().toISOString().split('T')[0]);
            if (!data.is_trial) {
                setData('status', 'active');
            }
        } else {
            setData('paid_at', '');
            if (!data.is_trial) {
                setData('status', 'pending_payment');
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Ensure all required fields have values
        const formData = {
            ...data,
            // These will be overwritten by controller from package
            // but we need to send them to avoid null issues
            allowed_projects: 0,
            allowed_tasks_per_project: 0,
            allowed_total_tasks: 0,
            allowed_team_members: 1,
            allowed_clients: 0,
            allowed_storage_mb: 100,
            feature_snapshot: {},
        };

        post(route('memberships.store'), formData, {
            onSuccess: () => {
                reset();
            },
        });
    };

    // ── Theme variables — matching Organizations style ──
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
        heading: isDark ? 'text-white/80' : 'text-gray-800',
        subheading: isDark ? 'text-slate-600' : 'text-gray-400',
        body: isDark ? 'text-white/85' : 'text-gray-900',
        muted: isDark ? 'text-slate-500' : 'text-gray-500',

        // Interactive states
        rowHover: isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50',

        // Inputs
        input: isDark ? 'bg-white/[0.03] border-white/[0.07] text-white/85 placeholder:text-slate-700 focus:border-violet-500/50 focus:bg-violet-500/[0.04]' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:ring-0',
        inputError: isDark ? 'border-red-500/50 focus:border-red-500' : 'border-red-500 focus:border-red-500',

        // Labels
        label: isDark ? 'text-slate-400' : 'text-gray-600',

        // Checkbox/Radio
        checkbox: isDark ? 'bg-white/[0.03] border-white/[0.07] text-violet-600 focus:ring-violet-500/50' : 'bg-white border-gray-300 text-violet-600 focus:ring-violet-500',

        // Header specific
        headerTitle: isDark ? 'text-white/90' : 'text-gray-900',
        headerSub: isDark ? 'text-slate-500' : 'text-gray-400',

        // Welcome banner specific
        welcomeGreet: isDark ? 'text-violet-400/70' : 'text-violet-600',
        welcomeTitle: isDark ? 'text-white/90' : 'text-gray-900',
        welcomeName: isDark ? 'text-violet-400' : 'text-violet-600',
        welcomeDesc: isDark ? 'text-slate-500' : 'text-gray-500',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className={`w-0.5 h-5 rounded-full ${isDark ? 'bg-violet-500' : 'bg-violet-600'}`} />
                    <div>
                        <h2 className={`text-[13.5px] font-semibold leading-tight tracking-wide ${themeClasses.headerTitle}`}>
                            Create Membership
                        </h2>
                        <p className={`text-[11px] font-light tracking-widest uppercase mt-0.5 ${themeClasses.headerSub}`}>
                            New subscription
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Create Membership" />

            <div className={`min-h-screen transition-colors duration-300 ${themeClasses.pageBg}`}>
                <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

                    {/* ── Welcome Banner ── */}
                    <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
                        <div className="absolute top-0 right-0 w-96 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative px-6 sm:px-8 py-7">
                            <p className={`text-[10px] font-bold tracking-[0.35em] uppercase mb-2 ${themeClasses.welcomeGreet}`}>
                                New Membership
                            </p>
                            <h1 className={`text-xl sm:text-2xl font-semibold tracking-tight leading-snug ${themeClasses.welcomeTitle}`}>
                                Create <span className={themeClasses.welcomeName}>Membership</span>
                            </h1>
                            <p className={`text-sm font-light mt-2 leading-relaxed max-w-md ${themeClasses.welcomeDesc}`}>
                                Set up a new subscription for an organization.
                            </p>
                        </div>
                    </div>

                    {/* ── Create Form ── */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Organization Selection */}
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                            <div className="px-6 py-5">
                                <h3 className={`text-[13px] font-semibold mb-4 ${themeClasses.heading}`}>Organization</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${themeClasses.label}`}>
                                            Select Organization <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            value={data.organization_id}
                                            onChange={e => setData('organization_id', e.target.value)}
                                            className={`w-full px-4 py-2.5 rounded-lg text-[13px] border transition-all duration-200 ${themeClasses.input} ${errors.organization_id ? themeClasses.inputError : ''}`}
                                        >
                                            <option value="">Choose an organization...</option>
                                            {organizations.map(org => (
                                                <option key={org.id} value={org.id}>{org.name}</option>
                                            ))}
                                        </select>
                                        {errors.organization_id && (
                                            <p className="mt-1 text-[11px] text-red-400">{errors.organization_id}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Package Selection */}
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                            <div className="px-6 py-5">
                                <h3 className={`text-[13px] font-semibold mb-4 ${themeClasses.heading}`}>Package & Billing</h3>

                                <div className="space-y-4">
                                    {/* Package */}
                                    <div>
                                        <label className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${themeClasses.label}`}>
                                            Select Package <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            value={data.package_id}
                                            onChange={e => setData('package_id', e.target.value)}
                                            className={`w-full px-4 py-2.5 rounded-lg text-[13px] border transition-all duration-200 ${themeClasses.input} ${errors.package_id ? themeClasses.inputError : ''}`}
                                        >
                                            <option value="">Choose a package...</option>
                                            {packages.map(pkg => (
                                                <option key={pkg.id} value={pkg.id}>
                                                    {pkg.name} - ₹{pkg.price_monthly}/mo
                                                </option>
                                            ))}
                                        </select>
                                        {errors.package_id && (
                                            <p className="mt-1 text-[11px] text-red-400">{errors.package_id}</p>
                                        )}
                                    </div>

                                    {/* Package Details (if selected) */}
                                    {selectedPackage && (
                                        <div className={`mt-4 p-4 rounded-xl border ${themeClasses.card}`}>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${themeClasses.subheading}`}>
                                                        Projects
                                                    </p>
                                                    <p className={`text-[13px] font-semibold ${themeClasses.body}`}>
                                                        {selectedPackage.max_projects === 0 ? 'Unlimited' : selectedPackage.max_projects}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${themeClasses.subheading}`}>
                                                        Team Members
                                                    </p>
                                                    <p className={`text-[13px] font-semibold ${themeClasses.body}`}>
                                                        {selectedPackage.max_team_members}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${themeClasses.subheading}`}>
                                                        Storage
                                                    </p>
                                                    <p className={`text-[13px] font-semibold ${themeClasses.body}`}>
                                                        {selectedPackage.max_storage_mb} MB
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${themeClasses.subheading}`}>
                                                        Trial Days
                                                    </p>
                                                    <p className={`text-[13px] font-semibold ${themeClasses.body}`}>
                                                        {selectedPackage.trial_days || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Billing Cycle */}
                                    <div>
                                        <label className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${themeClasses.label}`}>
                                            Billing Cycle <span className="text-red-400">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {['monthly', 'quarterly', 'yearly', 'lifetime'].map(cycle => (
                                                <label
                                                    key={cycle}
                                                    className={`
                                                        relative flex items-center justify-center px-3 py-2.5 rounded-lg border cursor-pointer transition-all
                                                        ${data.billing_cycle === cycle
                                                            ? 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                                                            : themeClasses.card + ' ' + themeClasses.rowHover
                                                        }
                                                    `}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="billing_cycle"
                                                        value={cycle}
                                                        checked={data.billing_cycle === cycle}
                                                        onChange={handleBillingCycleChange}
                                                        className="sr-only"
                                                    />
                                                    <span className="text-[12px] font-medium capitalize">{cycle}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dates & Trial */}
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                            <div className="px-6 py-5">
                                <h3 className={`text-[13px] font-semibold mb-4 ${themeClasses.heading}`}>Dates & Trial</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Start Date */}
                                    <div>
                                        <label className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${themeClasses.label}`}>
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={data.start_date}
                                            onChange={handleStartDateChange}
                                            className={`w-full px-4 py-2.5 rounded-lg text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                        />
                                    </div>

                                    {/* End Date (auto-calculated) */}
                                    <div>
                                        <label className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${themeClasses.label}`}>
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={data.end_date}
                                            readOnly
                                            className={`w-full px-4 py-2.5 rounded-lg text-[13px] border bg-opacity-50 cursor-not-allowed ${themeClasses.input}`}
                                        />
                                        {data.billing_cycle === 'lifetime' && (
                                            <p className="mt-1 text-[10px] text-violet-400">Lifetime membership (no end date)</p>
                                        )}
                                    </div>

                                    {/* Trial Toggle */}
                                    <div className="sm:col-span-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.is_trial}
                                                onChange={handleTrialToggle}
                                                className={`w-4 h-4 rounded border transition-colors ${themeClasses.checkbox}`}
                                            />
                                            <span className={`text-[13px] ${themeClasses.body}`}>This is a trial membership</span>
                                        </label>
                                    </div>

                                    {/* Trial Fields */}
                                    {showTrialFields && (
                                        <>
                                            <div>
                                                <label className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${themeClasses.label}`}>
                                                    Trial Days
                                                </label>
                                                <input
                                                    type="number"
                                                    value={data.trial_days}
                                                    onChange={e => setData('trial_days', e.target.value)}
                                                    className={`w-full px-4 py-2.5 rounded-lg text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                                    min="1"
                                                    max="365"
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${themeClasses.label}`}>
                                                    Trial Ends At
                                                </label>
                                                <input
                                                    type="date"
                                                    value={data.trial_ends_at}
                                                    onChange={e => setData('trial_ends_at', e.target.value)}
                                                    className={`w-full px-4 py-2.5 rounded-lg text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                            <div className="px-6 py-5">
                                <h3 className={`text-[13px] font-semibold mb-4 ${themeClasses.heading}`}>Payment Information</h3>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Price Paid */}
                                        <div>
                                            <label className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${themeClasses.label}`}>
                                                Price Paid <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={data.price_paid}
                                                    onChange={e => setData('price_paid', e.target.value)}
                                                    className={`w-full pl-8 pr-4 py-2.5 rounded-lg text-[13px] border transition-all duration-200 ${themeClasses.input} ${errors.price_paid ? themeClasses.inputError : ''}`}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            {errors.price_paid && (
                                                <p className="mt-1 text-[11px] text-red-400">{errors.price_paid}</p>
                                            )}
                                        </div>

                                        {/* Payment Status */}
                                        <div>
                                            <label className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${themeClasses.label}`}>
                                                Payment Status
                                            </label>
                                            <select
                                                value={data.payment_status}
                                                onChange={handlePaymentStatusChange}
                                                className={`w-full px-4 py-2.5 rounded-lg text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                                <option value="failed">Failed</option>
                                                <option value="refunded">Refunded</option>
                                            </select>
                                        </div>

                                        {/* Discount Toggle */}
                                        <div className="sm:col-span-2">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={showDiscountFields}
                                                    onChange={e => setShowDiscountFields(e.target.checked)}
                                                    className={`w-4 h-4 rounded border transition-colors ${themeClasses.checkbox}`}
                                                />
                                                <span className={`text-[13px] ${themeClasses.body}`}>Apply discount or coupon</span>
                                            </label>
                                        </div>

                                        {/* Discount Fields */}
                                        {showDiscountFields && (
                                            <>
                                                <div>
                                                    <label className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${themeClasses.label}`}>
                                                        Discount Amount
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={data.discount_amount}
                                                            onChange={e => setData('discount_amount', e.target.value)}
                                                            className={`w-full pl-8 pr-4 py-2.5 rounded-lg text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${themeClasses.label}`}>
                                                        Coupon Code
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.coupon_code}
                                                        onChange={e => setData('coupon_code', e.target.value)}
                                                        className={`w-full px-4 py-2.5 rounded-lg text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                                        placeholder="SAVE10"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Transaction ID */}
                                        <div>
                                            <label className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${themeClasses.label}`}>
                                                Transaction ID
                                            </label>
                                            <input
                                                type="text"
                                                value={data.transaction_id}
                                                onChange={e => setData('transaction_id', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-lg text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                                placeholder="TXN_123456"
                                            />
                                        </div>

                                        {/* Paid At */}
                                        {data.payment_status === 'paid' && (
                                            <div>
                                                <label className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${themeClasses.label}`}>
                                                    Paid At
                                                </label>
                                                <input
                                                    type="date"
                                                    value={data.paid_at}
                                                    onChange={e => setData('paid_at', e.target.value)}
                                                    className={`w-full px-4 py-2.5 rounded-lg text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Auto Renewal */}
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                            <div className="px-6 py-5">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.auto_renew}
                                            onChange={handleAutoRenewToggle}
                                            disabled={data.billing_cycle === 'lifetime'}
                                            className={`w-4 h-4 rounded border transition-colors ${themeClasses.checkbox} ${data.billing_cycle === 'lifetime' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                        <div>
                                            <span className={`text-[13px] ${themeClasses.body}`}>Enable auto-renewal</span>
                                            {data.billing_cycle === 'lifetime' && (
                                                <p className={`text-[10px] ${themeClasses.muted}`}>Not applicable for lifetime memberships</p>
                                            )}
                                        </div>
                                    </label>

                                    {data.auto_renew && data.billing_cycle !== 'lifetime' && (
                                        <div>
                                            <label className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${themeClasses.label}`}>
                                                Next Billing Date
                                            </label>
                                            <input
                                                type="date"
                                                value={data.next_billing_date}
                                                onChange={e => setData('next_billing_date', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-lg text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className={`relative rounded-2xl border overflow-hidden transition-colors duration-300 ${themeClasses.card}`}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

                            <div className="px-6 py-5">
                                <h3 className={`text-[13px] font-semibold mb-4 ${themeClasses.heading}`}>Additional Notes</h3>

                                <textarea
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    rows="4"
                                    className={`w-full px-4 py-2.5 rounded-lg text-[13px] border transition-all duration-200 ${themeClasses.input}`}
                                    placeholder="Enter any internal notes about this membership..."
                                />
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end gap-3">
                            <Link
                                href={route('memberships.index')}
                                className={`px-6 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${themeClasses.muted} hover:text-white`}
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-gradient-to-br from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white text-[13px] font-semibold tracking-wider rounded-lg shadow-lg shadow-violet-900/40 ring-1 ring-violet-500/30 transition-all duration-300 disabled:opacity-50"
                            >
                                {processing ? 'Creating...' : 'Create Membership'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
