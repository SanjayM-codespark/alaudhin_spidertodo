import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ order, isOverdue }) {
    const { auth } = usePage().props;
    const userRole = auth.user?.role_type;
    const isAdmin = userRole === 'admin';
    const isVendor = userRole === 'vendor';

    const [isStatusUpdating, setIsStatusUpdating] = useState(false);
    const [isExtendingDueDate, setIsExtendingDueDate] = useState(false);
    const [newDueDate, setNewDueDate] = useState('');

    // Handle status update - Only admins
    const handleStatusUpdate = (status) => {
        if (!isAdmin) {
            alert('You do not have permission to update order status');
            return;
        }

        setIsStatusUpdating(true);
        router.post(route('orders.update-status', order.id), { status }, {
            preserveScroll: true,
            onFinish: () => setIsStatusUpdating(false)
        });
    };

    // Handle extend due date - Only admins
    const handleExtendDueDate = () => {
        if (!isAdmin) {
            alert('You do not have permission to extend due date');
            return;
        }

        if (!newDueDate) return;

        setIsExtendingDueDate(true);
        router.post(route('orders.extend-due-date', order.id), { new_due_date: newDueDate }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewDueDate('');
                setIsExtendingDueDate(false);
            },
            onError: () => {
                setIsExtendingDueDate(false);
            }
        });
    };

    // Handle delete - Only admins
    const handleDelete = () => {
        if (!isAdmin) {
            alert('You do not have permission to delete orders');
            return;
        }

        if (confirm(`Are you sure you want to delete order ${order.order_number}?`)) {
            router.delete(route('orders.destroy', order.id));
        }
    };

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(value || 0);
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleString('en-IN', {
            dateStyle: 'full',
            timeStyle: 'short'
        });
    };

    // Format date only
    const formatDateOnly = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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
    const getDueDateStatus = () => {
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
    const getDueDateBadge = () => {
        const status = getDueDateStatus();
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} border ${style.border}`}>
                {style.label}
            </span>
        );
    };

    // Get minimum datetime for extension (tomorrow)
    const getMinExtendDateTime = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().slice(0, 16);
    };

    // Available statuses for dropdown
    const statuses = ['draft', 'pending', 'confirmed', 'processing', 'completed', 'cancelled'];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-amber-400 rounded-full" />
                    <div>
                        <h2 className="text-base font-semibold text-white/90 leading-tight">
                            Order Details
                        </h2>
                        <p className="text-xs text-slate-500 font-light tracking-wide mt-0.5">
                            {isVendor ? 'View order information' : 'View and manage order information'}
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
            <Head title={`Order ${order.order_number}`} />

            <div className="min-h-screen bg-[#0a0b0f]">
                {/* Top gradient rule */}
                <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent mb-8" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
                    {/* Header with actions */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route('orders.index')}
                                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-400/20 transition-all duration-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-semibold text-white/90">Order {order.order_number}</h1>
                                    {getDueDateBadge()}
                                </div>
                                <p className="text-sm text-slate-500 mt-1">Placed on {formatDate(order.order_date)}</p>
                            </div>
                        </div>

                        {/* Action Buttons - Only for Admins */}
                        {isAdmin && (
                            <div className="flex items-center gap-2">
                                <Link
                                    href={route('orders.edit', order.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 transition-all duration-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span className="text-sm">Edit</span>
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-400/10 hover:bg-red-400/15 border border-red-400/20 rounded-xl text-red-400 transition-all duration-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span className="text-sm">Delete</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Order Details (Viewable by both roles) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Items Card */}
                            <div className="relative rounded-2xl bg-[#0f1117] border border-white/[0.06] overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                                <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center">
                                    <h3 className="text-sm font-semibold text-white/80">Order Items</h3>
                                    <span className="text-xs bg-white/5 text-slate-400 px-2 py-1 rounded-full">
                                        {order.items.length} items
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/[0.06]">
                                                <th className="px-6 py-3 text-left text-xs text-slate-500">Product</th>
                                                <th className="px-6 py-3 text-left text-xs text-slate-500">Unit</th>
                                                <th className="px-6 py-3 text-left text-xs text-slate-500">Qty</th>
                                                <th className="px-6 py-3 text-left text-xs text-slate-500">Unit Price</th>
                                                <th className="px-6 py-3 text-left text-xs text-slate-500">Discount</th>
                                                <th className="px-6 py-3 text-left text-xs text-slate-500">Subtotal</th>
                                                <th className="px-6 py-3 text-right text-xs text-slate-500">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.06]">
                                            {order.items.map((item) => (
                                                <tr key={item.id} className="hover:bg-white/[0.02]">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-white/90">
                                                                {item.product_name}
                                                            </p>
                                                            {item.product_sku && (
                                                                <p className="text-xs text-slate-500 font-mono mt-0.5">
                                                                    SKU: {item.product_sku}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                                                                <span className="text-amber-400 text-xs font-semibold">
                                                                    {item.unit_code?.charAt(0)}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm text-slate-400">
                                                                {item.unit_name} ({item.unit_code})
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-white/80">{item.quantity}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-400">
                                                            {formatCurrency(item.unit_price)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.discount_percentage > 0 ? (
                                                            <span className="text-xs bg-emerald-400/10 text-emerald-400 px-2 py-1 rounded-full">
                                                                {item.discount_percentage}% off
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-slate-600">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-white/80">
                                                            {formatCurrency(item.subtotal)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-sm font-medium text-amber-400">
                                                            {formatCurrency(item.total)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Notes Card */}
                            {order.notes && (
                                <div className="relative rounded-2xl bg-[#0f1117] border border-white/[0.06] overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                                    <div className="px-6 py-4 border-b border-white/[0.06]">
                                        <h3 className="text-sm font-semibold text-white/80">Order Notes</h3>
                                    </div>

                                    <div className="p-6">
                                        <p className="text-sm text-slate-400 whitespace-pre-wrap">{order.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="space-y-6">
                            {/* Status Card */}
                            <div className="relative rounded-2xl bg-[#0f1117] border border-white/[0.06] overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                                <div className="px-6 py-4 border-b border-white/[0.06]">
                                    <h3 className="text-sm font-semibold text-white/80">Order Status</h3>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`px-3 py-1.5 rounded-full border ${getStatusColor(order.status)}`}>
                                            <span className="text-xs font-medium capitalize">{order.status}</span>
                                        </div>
                                        <span className="text-xs text-slate-500">
                                            Last updated: {new Date(order.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Status Update - Only for Admins */}
                                    {isAdmin ? (
                                        <>
                                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                                Update Status
                                            </label>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(e.target.value)}
                                                disabled={isStatusUpdating}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-amber-400/30 disabled:opacity-50"
                                            >
                                                {statuses.map(status => (
                                                    <option key={status} value={status} className="bg-[#0f1117] capitalize">
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </>
                                    ) : (
                                        <div className="text-sm text-slate-400 border-t border-white/[0.06] pt-3">
                                            Status updates are restricted to administrators only.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Due Date Card */}
                            {order.order_due_date && (
                                <div className="relative rounded-2xl bg-[#0f1117] border border-white/[0.06] overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                                    <div className="px-6 py-4 border-b border-white/[0.06]">
                                        <h3 className="text-sm font-semibold text-white/80">Due Date</h3>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className={`text-sm font-medium ${
                                                    getDueDateStatus() === 'overdue'
                                                        ? 'text-red-400'
                                                        : getDueDateStatus() === 'due-today'
                                                        ? 'text-amber-400'
                                                        : 'text-white/90'
                                                }`}>
                                                    {formatDate(order.order_due_date)}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {formatDateOnly(order.order_due_date)}
                                                </p>
                                            </div>
                                            {getDueDateBadge()}
                                        </div>

                                        {/* Extend Due Date - Only for Admins */}
                                        {isAdmin && !['completed', 'cancelled'].includes(order.status) && (
                                            <div className="mt-4 pt-4 border-t border-white/[0.06]">
                                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                                    Extend Due Date
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="datetime-local"
                                                        value={newDueDate}
                                                        min={getMinExtendDateTime()}
                                                        onChange={(e) => setNewDueDate(e.target.value)}
                                                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:border-amber-400/30"
                                                    />
                                                    <button
                                                        onClick={handleExtendDueDate}
                                                        disabled={isExtendingDueDate || !newDueDate}
                                                        className="px-4 py-2 bg-amber-400/10 hover:bg-amber-400/15 border border-amber-400/20 rounded-lg text-amber-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isExtendingDueDate ? '...' : 'Extend'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Summary Card */}
                            <div className="relative rounded-2xl bg-[#0f1117] border border-white/[0.06] overflow-hidden sticky top-4">
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                                <div className="px-6 py-4 border-b border-white/[0.06]">
                                    <h3 className="text-sm font-semibold text-white/80">Order Summary</h3>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Customer Info */}
                                    {order.customer_name && (
                                        <div className="pb-4 border-b border-white/[0.06]">
                                            <p className="text-xs text-slate-500 mb-1">Customer</p>
                                            <p className="text-sm text-white/90">{order.customer_name}</p>
                                        </div>
                                    )}

                                    {/* Financial Summary */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Subtotal</span>
                                            <span className="text-white/90">{formatCurrency(order.subtotal)}</span>
                                        </div>

                                        {order.discount_amount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Discount</span>
                                                <span className="text-emerald-400">-{formatCurrency(order.discount_amount)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-white/[0.06]">
                                            <span className="text-slate-400">Total</span>
                                            <span className="text-amber-400">{formatCurrency(order.total_amount)}</span>
                                        </div>
                                    </div>

                                    {/* Timestamps */}
                                    <div className="pt-4 border-t border-white/[0.06] space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Created</span>
                                            <span className="text-slate-400">{new Date(order.created_at).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Last Updated</span>
                                            <span className="text-slate-400">{new Date(order.updated_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
