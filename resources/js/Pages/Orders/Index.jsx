import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

export default function Index({ orders, dailyStats, filters, statuses }) {
    const { auth } = usePage().props;
    const userRole = auth.user?.role_type; // 'admin' or 'vendor'
    const isAdmin = userRole === 'admin';
    const isVendor = userRole === 'vendor';

    // Calculate date from 7 days ago for default filter
    const getDefaultDateFrom = () => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date.toISOString().split('T')[0];
    };

    // Initialize state from filters or defaults (last 7 days)
    const [dateFromFilter, setDateFromFilter] = useState(filters.date_from || getDefaultDateFrom());
    const [dateToFilter, setDateToFilter] = useState(filters.date_to || new Date().toISOString().split('T')[0]);
    const [dueDateFilter, setDueDateFilter] = useState(filters.due_date || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [search, setSearch] = useState(filters.search || '');

    // Refs for debounce
    const searchTimeout = useRef(null);

    // Update local state when filters change from URL
    useEffect(() => {
        setDateFromFilter(filters.date_from || getDefaultDateFrom());
        setDateToFilter(filters.date_to || new Date().toISOString().split('T')[0]);
        setDueDateFilter(filters.due_date || '');
        setStatusFilter(filters.status || 'all');
        setSearch(filters.search || '');
    }, [filters]);

    // Handle filter changes
    const handleFilter = (key, value) => {
        // Build new filters object
        const newFilters = { ...filters, [key]: value, page: 1 };

        // Remove empty filters
        Object.keys(newFilters).forEach(key => {
            if (!newFilters[key] || newFilters[key] === 'all') {
                delete newFilters[key];
            }
        });

        // Ensure date range defaults if not present
        if (!newFilters.date_from) {
            newFilters.date_from = getDefaultDateFrom();
        }
        if (!newFilters.date_to) {
            newFilters.date_to = new Date().toISOString().split('T')[0];
        }

        router.get(
            route('orders.index'),
            newFilters,
            { preserveState: true, replace: true }
        );
    };

    // Handle date range filter
    const handleDateRangeFilter = (from, to) => {
        const newFilters = { ...filters, date_from: from, date_to: to, page: 1 };

        // Remove empty dates
        if (!from) delete newFilters.date_from;
        if (!to) delete newFilters.date_to;

        router.get(
            route('orders.index'),
            newFilters,
            { preserveState: true, replace: true }
        );
    };

    // Handle quick date ranges
    const handleQuickDateRange = (days) => {
        const to = new Date().toISOString().split('T')[0];
        const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        setDateFromFilter(from);
        setDateToFilter(to);
        handleDateRangeFilter(from, to);
    };

    // Handle search with debounce
    const handleSearch = (value) => {
        setSearch(value);

        // Clear existing timeout
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        // Set new timeout
        searchTimeout.current = setTimeout(() => {
            const newFilters = { ...filters, search: value, page: 1 };

            // Remove empty search
            if (!value) {
                delete newFilters.search;
            }

            router.get(
                route('orders.index'),
                newFilters,
                { preserveState: true, replace: true }
            );
        }, 500);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, []);

    // Handle status update - Only admins can do this
    const handleStatusUpdate = (id, status) => {
        if (!isAdmin) {
            alert('You do not have permission to update order status');
            return;
        }
        router.post(route('orders.update-status', id), { status }, {
            preserveScroll: true
        });
    };

    // Handle delete - Only admins can do this
    const handleDelete = (id, orderNumber) => {
        if (!isAdmin) {
            alert('You do not have permission to delete orders');
            return;
        }
        if (confirm(`Are you sure you want to delete order ${orderNumber}?`)) {
            router.delete(route('orders.destroy', id));
        }
    };

    // Handle due today filter
    const handleDueTodayFilter = () => {
        router.get(
            route('orders.index'),
            { due_today: true, page: 1 },
            { preserveState: true, replace: true }
        );
    };

    // Handle overdue filter
    const handleOverdueFilter = () => {
        router.get(
            route('orders.index'),
            { overdue: true, page: 1 },
            { preserveState: true, replace: true }
        );
    };

    // Clear all filters but keep default date range
    const handleClearFilters = () => {
        const defaultFrom = getDefaultDateFrom();
        const defaultTo = new Date().toISOString().split('T')[0];

        setDateFromFilter(defaultFrom);
        setDateToFilter(defaultTo);

        router.get(
            route('orders.index'),
            {
                date_from: defaultFrom,
                date_to: defaultTo,
                page: 1
            },
            { preserveState: true, replace: true }
        );
    };

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(value || 0);
    };

    // Format date time
    const formatDateTime = (datetime) => {
        if (!datetime) return '—';
        return new Date(datetime).toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format date only
    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN');
    };

    // Get status badge color
    const getStatusColor = (status) => {
        const colors = {
            draft: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
            pending: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
            confirmed: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
            processing: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
            completed: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
            cancelled: 'bg-red-400/10 text-red-400 border-red-400/20'
        };
        return colors[status] || colors.draft;
    };

    // Get due date status
    const getDueDateStatus = (order) => {
        if (!order.order_due_date) return null;
        if (['completed', 'cancelled'].includes(order.status)) return null;

        const dueDate = new Date(order.order_due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dueDate < today) {
            return 'overdue';
        } else if (dueDate.toDateString() === today.toDateString()) {
            return 'due-today';
        }
        return null;
    };

    // Get due date badge
    const DueDateBadge = ({ order }) => {
        const status = getDueDateStatus(order);
        if (!status) return null;

        const badges = {
            'overdue': {
                bg: 'bg-red-400/10',
                text: 'text-red-400',
                border: 'border-red-400/20',
                label: 'Overdue'
            },
            'due-today': {
                bg: 'bg-amber-400/10',
                text: 'text-amber-400',
                border: 'border-amber-400/20',
                label: 'Due Today'
            }
        };

        const style = badges[status];

        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} border ${style.border} ml-2`}>
                {style.label}
            </span>
        );
    };

    // Check if any non-default filters are active
    const hasActiveFilters = () => {
        const defaultFrom = getDefaultDateFrom();
        const defaultTo = new Date().toISOString().split('T')[0];

        return (
            (filters.date_from && filters.date_from !== defaultFrom) ||
            (filters.date_to && filters.date_to !== defaultTo) ||
            filters.due_date ||
            (filters.status && filters.status !== 'all') ||
            filters.search ||
            filters.overdue ||
            filters.due_today
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-amber-400 rounded-full" />
                    <div>
                        <h2 className="text-base font-semibold text-white/90 leading-tight">
                            Orders
                        </h2>
                        <p className="text-xs text-slate-500 font-light tracking-wide mt-0.5">
                            {isVendor ? 'View only - Your orders' : 'Track and manage orders'}
                        </p>
                        {isVendor && (
                            <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20">
                                Read Only Access
                            </span>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Orders" />

            <div className="min-h-screen bg-[#0a0b0f]">
                {/* Top gradient rule */}
                <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent mb-8" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 space-y-6" style={{maxWidth:"975px"}}>
                    {/* Header with actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-semibold text-white/90">Orders</h1>
                            <span className="text-xs bg-white/5 text-slate-400 px-2 py-1 rounded-full border border-white/10">
                                Total: {orders?.total || 0}
                            </span>
                            {dailyStats?.overdue > 0 && (
                                <button
                                    onClick={handleOverdueFilter}
                                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                                        filters.overdue
                                            ? 'bg-red-400/20 text-red-400 border-red-400/30'
                                            : 'bg-red-400/10 text-red-400 border-red-400/20 hover:bg-red-400/15'
                                    }`}
                                >
                                    {dailyStats.overdue} Overdue
                                </button>
                            )}
                            {dailyStats?.due_today > 0 && (
                                <button
                                    onClick={handleDueTodayFilter}
                                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                                        filters.due_today
                                            ? 'bg-amber-400/20 text-amber-400 border-amber-400/30'
                                            : 'bg-amber-400/10 text-amber-400 border-amber-400/20 hover:bg-amber-400/15'
                                    }`}
                                >
                                    {dailyStats.due_today} Due Today
                                </button>
                            )}
                        </div>

                        {/* New Order button - Only for admins */}
                        {isAdmin && (
                            <Link
                                href={route('orders.create')}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-400/10 hover:bg-amber-400/15 border border-amber-400/20 rounded-xl text-amber-400 transition-all duration-200 group"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-sm font-medium">New Order</span>
                            </Link>
                        )}
                    </div>

                    {/* Daily Stats Cards - Same for both roles */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative rounded-xl bg-[#0f1117] border border-white/[0.06] p-4">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
                            <p className="text-xs text-slate-500 mb-1">Today's Orders</p>
                            <p className="text-2xl font-semibold text-white/90">{dailyStats?.total_orders || 0}</p>
                        </div>
                        <div className="relative rounded-xl bg-[#0f1117] border border-white/[0.06] p-4">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
                            <p className="text-xs text-slate-500 mb-1">Today's Revenue</p>
                            <p className="text-2xl font-semibold text-emerald-400">{formatCurrency(dailyStats?.total_revenue || 0)}</p>
                        </div>
                        <div className="relative rounded-xl bg-[#0f1117] border border-white/[0.06] p-4">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
                            <p className="text-xs text-slate-500 mb-1">Average Order</p>
                            <p className="text-2xl font-semibold text-amber-400">{formatCurrency(dailyStats?.average_order || 0)}</p>
                        </div>
                        <div className="relative rounded-xl bg-[#0f1117] border border-white/[0.06] p-4">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
                            <p className="text-xs text-slate-500 mb-1">Due Today</p>
                            <p className="text-2xl font-semibold text-amber-400">{dailyStats?.due_today || 0}</p>
                            {dailyStats?.overdue > 0 && (
                                <p className="text-xs text-red-400 mt-1">{dailyStats.overdue} overdue</p>
                            )}
                        </div>
                    </div>

                    {/* Filters Bar - Same for both roles */}
                    <div className="relative rounded-2xl bg-[#0f1117] border border-white/[0.06] overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                        <div className="p-4">
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Date Range Filters */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={dateFromFilter}
                                        onChange={(e) => {
                                            setDateFromFilter(e.target.value);
                                            handleDateRangeFilter(e.target.value, dateToFilter);
                                        }}
                                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 focus:outline-none focus:border-amber-400/30"
                                        placeholder="From"
                                    />
                                    <span className="text-xs text-slate-600">to</span>
                                    <input
                                        type="date"
                                        value={dateToFilter}
                                        onChange={(e) => {
                                            setDateToFilter(e.target.value);
                                            handleDateRangeFilter(dateFromFilter, e.target.value);
                                        }}
                                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 focus:outline-none focus:border-amber-400/30"
                                        placeholder="To"
                                    />
                                </div>

                                {/* Quick Date Ranges */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleQuickDateRange(7)}
                                        className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg border border-white/10 transition-colors"
                                    >
                                        7 Days
                                    </button>
                                    <button
                                        onClick={() => handleQuickDateRange(30)}
                                        className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg border border-white/10 transition-colors"
                                    >
                                        30 Days
                                    </button>
                                    <button
                                        onClick={() => handleQuickDateRange(90)}
                                        className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg border border-white/10 transition-colors"
                                    >
                                        90 Days
                                    </button>
                                </div>

                                <input
                                    type="date"
                                    value={dueDateFilter || ''}
                                    onChange={(e) => handleFilter('due_date', e.target.value)}
                                    placeholder="Due Date"
                                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 focus:outline-none focus:border-amber-400/30"
                                />

                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleFilter('status', e.target.value)}
                                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 focus:outline-none focus:border-amber-400/30"
                                >
                                    <option value="all">All Status</option>
                                    {statuses?.map(status => (
                                        <option key={status} value={status} className="capitalize">{status}</option>
                                    ))}
                                </select>

                                <div className="relative flex-1 max-w-md">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        placeholder="Search by order # or customer..."
                                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30"
                                    />
                                </div>

                                {/* Clear filters button - show only when non-default filters are active */}
                                {hasActiveFilters() && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                                    >
                                        Reset to 7 Days
                                    </button>
                                )}
                            </div>

                            {/* Active date range indicator */}
                            <div className="mt-2 text-xs text-slate-600">
                                Showing orders from {formatDate(dateFromFilter)} to {formatDate(dateToFilter)}
                            </div>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="relative rounded-2xl bg-[#0f1117] border border-white/[0.06] overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/[0.06]">
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Order #</span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Date</span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Items</span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total</span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</span>
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.06]">
                                    {orders?.data?.length > 0 ? (
                                        orders.data.map((order) => (
                                            <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <Link
                                                        href={route('orders.show', order.id)}
                                                        className="text-sm font-mono text-amber-400 hover:text-amber-300"
                                                    >
                                                        {order.order_number}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-400">
                                                        {formatDate(order.order_date)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <span className={`text-sm ${
                                                            getDueDateStatus(order) === 'overdue'
                                                                ? 'text-red-400'
                                                                : getDueDateStatus(order) === 'due-today'
                                                                ? 'text-amber-400'
                                                                : 'text-slate-400'
                                                        }`}>
                                                            {formatDateTime(order.order_due_date)}
                                                        </span>
                                                        <DueDateBadge order={order} />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-white/80">
                                                        {order.customer_name || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-400">
                                                        {order.items?.length || 0} items
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium text-emerald-400">
                                                        {formatCurrency(order.total_amount)}
                                                    </span>
                                                    {order.discount_amount > 0 && (
                                                        <span className="text-xs text-slate-500 block">
                                                            -{formatCurrency(order.discount_amount)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isAdmin ? (
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                            className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(order.status)} focus:outline-none bg-transparent cursor-pointer`}
                                                        >
                                                            {statuses?.map(status => (
                                                                <option key={status} value={status} className="bg-[#0f1117]">
                                                                    {status}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* View button - Both roles can view */}
                                                        <Link
                                                            href={route('orders.show', order.id)}
                                                            className="p-2 text-slate-500 hover:text-amber-400 hover:bg-white/5 rounded-lg transition-colors"
                                                            title="View Order Details"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </Link>

                                                        {/* Edit button - Only admins */}
                                                        {isAdmin && (
                                                            <Link
                                                                href={route('orders.edit', order.id)}
                                                                className="p-2 text-slate-500 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-colors"
                                                                title="Edit Order"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </Link>
                                                        )}

                                                        {/* Delete button - Only admins */}
                                                        {isAdmin && (
                                                            <button
                                                                onClick={() => handleDelete(order.id, order.order_number)}
                                                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                                                                title="Delete Order"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-center mb-4">
                                                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-slate-500 text-sm font-light">No orders found</p>
                                                    <p className="text-slate-700 text-xs mt-1">
                                                        {hasActiveFilters()
                                                            ? 'Try adjusting your filters'
                                                            : isAdmin
                                                                ? 'Create your first order to get started'
                                                                : 'No orders available to view'}
                                                    </p>
                                                    {isAdmin && !hasActiveFilters() && (
                                                        <Link
                                                            href={route('orders.create')}
                                                            className="mt-4 px-4 py-2 bg-amber-400/10 border border-amber-400/20 rounded-lg text-amber-400 text-sm hover:bg-amber-400/15 transition-colors"
                                                        >
                                                            Create Order
                                                        </Link>
                                                    )}
                                                    {hasActiveFilters() && (
                                                        <button
                                                            onClick={handleClearFilters}
                                                            className="mt-4 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 text-sm hover:bg-white/10 transition-colors"
                                                        >
                                                            Reset to 7 Days
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {orders?.data?.length > 0 && orders.links && (
                            <div className="px-6 py-4 border-t border-white/[0.06]">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-slate-500">
                                        Showing {orders.from} to {orders.to} of {orders.total} results
                                    </p>
                                    <div className="flex gap-2">
                                        {/* Previous button */}
                                        {orders.links[0] && (
                                            <button
                                                onClick={() => orders.links[0].url && router.get(orders.links[0].url)}
                                                disabled={!orders.links[0].url}
                                                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                                    orders.links[0].url
                                                        ? 'text-slate-500 hover:text-slate-400 hover:bg-white/5'
                                                        : 'text-slate-700 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: orders.links[0].label }}
                                            />
                                        )}

                                        {/* Page numbers */}
                                        {orders.links.slice(1, -1).map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                                    link.active
                                                        ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                                                        : link.url
                                                            ? 'text-slate-500 hover:text-slate-400 hover:bg-white/5'
                                                            : 'text-slate-700 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}

                                        {/* Next button */}
                                        {orders.links[orders.links.length - 1] && (
                                            <button
                                                onClick={() => orders.links[orders.links.length - 1].url && router.get(orders.links[orders.links.length - 1].url)}
                                                disabled={!orders.links[orders.links.length - 1].url}
                                                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                                    orders.links[orders.links.length - 1].url
                                                        ? 'text-slate-500 hover:text-slate-400 hover:bg-white/5'
                                                        : 'text-slate-700 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: orders.links[orders.links.length - 1].label }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
