import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage, useForm } from "@inertiajs/react";
import { useEffect } from "react";

export default function Edit({ unit }) {
    const { auth } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        name: unit.name || "",
        code: unit.code || "",
        symbol: unit.symbol || "",
        type: unit.type || "standard",
        is_active: unit.is_active || true,
        description: unit.description || "",
        display_order: unit.display_order || 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("measurement-units.update", unit.id));
    };

    // Common unit types suggestions
    const unitTypeSuggestions = [
        "standard",
        "area",
        "volume",
        "weight",
        "length",
        "count",
        "time",
        "temperature",
        "pressure",
        "energy",
        "speed",
        "custom",
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-amber-400 rounded-full" />
                    <div>
                        <h2 className="text-base font-semibold text-white/90 leading-tight">
                            Edit Measurement Unit
                        </h2>
                        <p className="text-xs text-slate-500 font-light tracking-wide mt-0.5">
                            Update measurement unit information
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Edit ${unit.name}`} />

            <div className="min-h-screen bg-[#0a0b0f]">
                {/* Top gradient rule */}
                <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent mb-8" />

                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-12">
                    {/* Form Card */}
                    <div className="relative rounded-2xl bg-[#0f1117] border border-white/[0.06] overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                        {/* Header with back button and unit info */}
                        <div className="px-8 py-6 border-b border-white/[0.06] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link
                                    href={route("measurement-units.index")}
                                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-400/20 transition-all duration-200"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                        />
                                    </svg>
                                </Link>
                                <div>
                                    <h3 className="text-lg font-semibold text-white/90">
                                        Edit: {unit.name}
                                    </h3>
                                    <p className="text-xs text-slate-600 font-light mt-0.5">
                                        ID: {unit.id} • Created:{" "}
                                        {new Date(
                                            unit.created_at,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Unit code badge */}
                            <div className="px-3 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-lg">
                                <span className="text-xs font-mono font-medium text-amber-400">
                                    {unit.code}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* Name & Code Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Unit Name{" "}
                                        <span className="text-amber-400">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        placeholder="e.g., Square Feet, Kilogram, Packet"
                                        className={`w-full px-4 py-3 bg-white/5 border ${errors.name ? "border-red-400/30" : "border-white/10"} rounded-xl text-sm text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all`}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-red-400 mt-1">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Code Field */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Unit Code{" "}
                                        <span className="text-amber-400">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.code}
                                        onChange={(e) =>
                                            setData(
                                                "code",
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="e.g., SQFT, KG, PKT"
                                        className={`w-full px-4 py-3 bg-white/5 border ${errors.code ? "border-red-400/30" : "border-white/10"} rounded-xl text-sm text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all uppercase`}
                                    />
                                    {errors.code && (
                                        <p className="text-xs text-red-400 mt-1">
                                            {errors.code}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Symbol & Type Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Symbol Field */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Symbol{" "}
                                        <span className="text-slate-600">
                                            (optional)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.symbol}
                                        onChange={(e) =>
                                            setData("symbol", e.target.value)
                                        }
                                        placeholder="e.g., ft², kg, pkt"
                                        className={`w-full px-4 py-3 bg-white/5 border ${errors.symbol ? "border-red-400/30" : "border-white/10"} rounded-xl text-sm text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all`}
                                    />
                                    {errors.symbol && (
                                        <p className="text-xs text-red-400 mt-1">
                                            {errors.symbol}
                                        </p>
                                    )}
                                </div>

                                {/* Type Field with suggestions */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Unit Type{" "}
                                        <span className="text-amber-400">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.type}
                                            onChange={(e) =>
                                                setData("type", e.target.value)
                                            }
                                            placeholder="e.g., area, weight, volume"
                                            list="type-suggestions"
                                            className={`w-full px-4 py-3 bg-white/5 border ${errors.type ? "border-red-400/30" : "border-white/10"} rounded-xl text-sm text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all`}
                                        />
                                        <datalist id="type-suggestions">
                                            {unitTypeSuggestions.map((type) => (
                                                <option
                                                    key={type}
                                                    value={type}
                                                />
                                            ))}
                                        </datalist>
                                    </div>
                                    {errors.type && (
                                        <p className="text-xs text-red-400 mt-1">
                                            {errors.type}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Display Order & Status Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Display Order */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={data.display_order}
                                        onChange={(e) =>
                                            setData(
                                                "display_order",
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all"
                                    />
                                    <p className="text-xs text-slate-600">
                                        Lower numbers appear first
                                    </p>
                                </div>

                                {/* Active Status */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Status
                                    </label>
                                    <div className="flex items-center gap-4 h-[50px]">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setData("is_active", true)
                                            }
                                            className={`flex-1 px-4 py-2 rounded-xl border transition-all duration-200 ${
                                                data.is_active
                                                    ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400"
                                                    : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-400"
                                            }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                <span className="text-sm">
                                                    Active
                                                </span>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setData("is_active", false)
                                            }
                                            className={`flex-1 px-4 py-2 rounded-xl border transition-all duration-200 ${
                                                !data.is_active
                                                    ? "bg-slate-400/10 border-slate-400/20 text-slate-400"
                                                    : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-400"
                                            }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                                <span className="text-sm">
                                                    Inactive
                                                </span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Description Field */}
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    Description{" "}
                                    <span className="text-slate-600">
                                        (optional)
                                    </span>
                                </label>
                                <textarea
                                    rows="4"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                    placeholder="Enter a description for this measurement unit..."
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all resize-none"
                                />
                            </div>

                            {/* Preview Card */}
                            <div className="relative rounded-xl bg-white/3 border border-white/5 p-4">
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Live Preview
                                    </p>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${data.is_active ? "bg-emerald-400/10 text-emerald-400" : "bg-slate-400/10 text-slate-400"}`}
                                    >
                                        {data.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                                        <span className="text-amber-400 text-lg font-semibold">
                                            {data.symbol ||
                                                data.code?.charAt(0) ||
                                                "U"}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white/90 font-medium">
                                                {data.name || "Unit Name"}
                                            </span>
                                            <span className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                                                {data.code || "CODE"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Type:{" "}
                                            <span className="text-amber-400/80">
                                                {data.type || "standard"}
                                            </span>{" "}
                                            • Order:{" "}
                                            <span className="text-slate-400">
                                                {data.display_order}
                                            </span>
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                                            {data.description ||
                                                "No description provided"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 bg-white/3 rounded-xl p-4 border border-white/5">
                                <div>
                                    <span className="block text-slate-500 mb-1">
                                        Created
                                    </span>
                                    <span className="text-slate-400">
                                        {new Date(
                                            unit.created_at,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-slate-500 mb-1">
                                        Last Updated
                                    </span>
                                    <span className="text-slate-400">
                                        {new Date(
                                            unit.updated_at,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
                                <Link
                                    href={route("measurement-units.index")}
                                    className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-400 hover:text-slate-300 hover:bg-white/10 transition-all duration-200"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-amber-400/10 hover:bg-amber-400/15 border border-amber-400/20 rounded-xl text-amber-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <>
                                            <svg
                                                className="animate-spin h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            <span>Updating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                                />
                                            </svg>
                                            <span>Update Unit</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
