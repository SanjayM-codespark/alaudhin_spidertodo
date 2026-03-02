import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage, useForm, router } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function Create({ products }) {
    const { auth } = usePage().props;
    const [cartItems, setCartItems] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [calculatedPrice, setCalculatedPrice] = useState(null);
    const [availableUnits, setAvailableUnits] = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        customer_name: "",
        order_due_date: "",
        status: "pending",
        notes: "",
        items: [],
        discount_amount: 0,
    });

    // Set default due date to tomorrow at 5:00 PM
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(17, 0, 0, 0); // 5:00 PM

        // Format: YYYY-MM-DDTHH:MM
        const formattedDateTime = tomorrow.toISOString().slice(0, 16);
        setData("order_due_date", formattedDateTime);
    }, []);

    // Update cart items in form data
    useEffect(() => {
        setData("items", cartItems);
    }, [cartItems]);

    // Calculate cart totals
    const cartSubtotal = cartItems.reduce(
        (sum, item) => sum + item.subtotal,
        0,
    );
    const cartDiscount = parseFloat(data.discount_amount) || 0;
    const cartTotal = cartSubtotal - cartDiscount;

    // Handle product selection
    const handleProductSelect = (productId) => {
        const product = products.find((p) => p.id === parseInt(productId));
        setSelectedProduct(product);

        // Get available units for this product
        const units =
            product?.unit_prices?.map((up) => ({
                id: up.measurement_unit_id,
                name: up.measurement_unit?.name,
                code: up.measurement_unit?.code,
                price: up.final_price || up.price_per_unit,
                discount_percentage: up.discount_percentage,
                discount_amount: up.discount_amount,
                unit_price_id: up.id,
            })) || [];

        setAvailableUnits(units);
        setSelectedUnit(null);
        setCalculatedPrice(null);
    };

    // Handle unit selection and calculate price
    const handleUnitSelect = (unitId) => {
        const unit = availableUnits.find((u) => u.id === parseInt(unitId));
        setSelectedUnit(unit);

        if (unit && quantity > 0) {
            calculatePrice(unit, quantity);
        }
    };

    // Handle quantity change
    const handleQuantityChange = (value) => {
        const qty = parseFloat(value) || 0;
        setQuantity(qty);

        if (selectedUnit && qty > 0) {
            calculatePrice(selectedUnit, qty);
        }
    };

    // Calculate price based on unit and quantity
    const calculatePrice = (unit, qty) => {
        const subtotal = unit.price * qty;
        const discountAmount =
            subtotal * (unit.discount_percentage / 100) +
            unit.discount_amount * qty;
        const total = subtotal - discountAmount;

        setCalculatedPrice({
            unit_price: unit.price,
            quantity: qty,
            subtotal: subtotal,
            discount: discountAmount,
            total: total,
            discount_percentage: unit.discount_percentage,
            discount_amount_per_unit: unit.discount_amount,
        });
    };

    // Add item to cart
    const addToCart = () => {
        if (
            !selectedProduct ||
            !selectedUnit ||
            quantity <= 0 ||
            !calculatedPrice
        ) {
            return;
        }

        const newItem = {
            id: Date.now(), // temporary id for frontend
            product_id: selectedProduct.id,
            product_name: selectedProduct.name,
            measurement_unit_id: selectedUnit.id,
            unit_name: selectedUnit.name,
            unit_code: selectedUnit.code,
            quantity: quantity,
            unit_price: selectedUnit.price,
            discount_percentage: selectedUnit.discount_percentage,
            subtotal: calculatedPrice.subtotal,
            total: calculatedPrice.total,
            product_sku: selectedProduct.sku,
        };

        setCartItems([...cartItems, newItem]);

        // Reset selection
        setSelectedProduct(null);
        setSelectedUnit(null);
        setQuantity(1);
        setCalculatedPrice(null);
        document.getElementById("product-select").value = "";
    };

    // Remove item from cart
    const removeFromCart = (itemId) => {
        setCartItems(cartItems.filter((item) => item.id !== itemId));
    };

    // Update item quantity
    const updateItemQuantity = (itemId, newQuantity) => {
        if (newQuantity <= 0) return;

        const updatedItems = cartItems.map((item) => {
            if (item.id === itemId) {
                const subtotal = item.unit_price * newQuantity;
                const discountAmount =
                    subtotal * (item.discount_percentage / 100);
                const total = subtotal - discountAmount;

                return {
                    ...item,
                    quantity: newQuantity,
                    subtotal: subtotal,
                    total: total,
                };
            }
            return item;
        });

        setCartItems(updatedItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("orders.store"));
    };

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
        }).format(value || 0);
    };

    // Format datetime for display
    const formatDateTime = (datetime) => {
        if (!datetime) return "";
        return new Date(datetime).toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    // Get minimum datetime (now)
    const getMinDateTime = () => {
        const now = new Date();
        return now.toISOString().slice(0, 16);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-amber-400 rounded-full" />
                    <div>
                        <h2 className="text-base font-semibold text-white/90 leading-tight">
                            Create New Order
                        </h2>
                        <p className="text-xs text-slate-500 font-light tracking-wide mt-0.5">
                            Add products and create an order
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Create Order" />

            <div className="min-h-screen bg-[#0a0b0f]">
                {/* Top gradient rule */}
                <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent mb-8" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Order Details */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Order Information Card */}
                                <div className="relative rounded-2xl bg-[#0f1117] border border-white/[0.06] overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                                    <div className="px-6 py-4 border-b border-white/[0.06]">
                                        <h3 className="text-sm font-semibold text-white/80">
                                            Order Information
                                        </h3>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        {/* Customer Name */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Customer Name{" "}
                                                <span className="text-slate-600">
                                                    (optional)
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.customer_name}
                                                onChange={(e) =>
                                                    setData(
                                                        "customer_name",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Enter customer name"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all"
                                            />
                                        </div>

                                        {/* Order Due Date with Time */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Due Date & Time <span className="text-amber-400/70">*</span>
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={data.order_due_date}
                                                min={getMinDateTime()}
                                                onChange={(e) =>
                                                    setData(
                                                        "order_due_date",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all"
                                            />
                                            {data.order_due_date && (
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-xs text-slate-500">
                                                        Expected delivery: <span className="text-amber-400/90">{formatDateTime(data.order_due_date)}</span>
                                                    </p>
                                                    <p className="text-xs text-slate-600">
                                                        Format: DD/MM/YYYY HH:MM AM/PM
                                                    </p>
                                                </div>
                                            )}
                                            {errors.order_due_date && (
                                                <p className="text-xs text-red-400 mt-1">{errors.order_due_date}</p>
                                            )}
                                        </div>

                                        {/* Order Status */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Order Status
                                            </label>
                                            <select
                                                value={data.status}
                                                onChange={(e) =>
                                                    setData(
                                                        "status",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-amber-400/30"
                                            >
                                                <option
                                                    value="draft"
                                                    className="bg-[#0f1117]"
                                                >
                                                    Draft
                                                </option>
                                                <option
                                                    value="pending"
                                                    className="bg-[#0f1117]"
                                                >
                                                    Pending
                                                </option>
                                                <option
                                                    value="confirmed"
                                                    className="bg-[#0f1117]"
                                                >
                                                    Confirmed
                                                </option>
                                                <option
                                                    value="processing"
                                                    className="bg-[#0f1117]"
                                                >
                                                    Processing
                                                </option>
                                                <option
                                                    value="completed"
                                                    className="bg-[#0f1117]"
                                                >
                                                    Completed
                                                </option>
                                            </select>
                                        </div>

                                        {/* Notes */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Notes{" "}
                                                <span className="text-slate-600">
                                                    (optional)
                                                </span>
                                            </label>
                                            <textarea
                                                rows="3"
                                                value={data.notes}
                                                onChange={(e) =>
                                                    setData(
                                                        "notes",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Add any notes about this order..."
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder-slate-600 focus:outline-none focus:border-amber-400/30 focus:ring-1 focus:ring-amber-400/20 transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Add Items Card */}
                                <div className="relative rounded-2xl bg-[#0f1117] border border-white/[0.06] overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                                    <div className="px-6 py-4 border-b border-white/[0.06]">
                                        <h3 className="text-sm font-semibold text-white/80">
                                            Add Items
                                        </h3>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        {/* Product Selection */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                    Select Product
                                                </label>
                                                <select
                                                    id="product-select"
                                                    onChange={(e) =>
                                                        handleProductSelect(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-amber-400/30"
                                                >
                                                    <option
                                                        value=""
                                                        className="bg-[#0f1117]"
                                                    >
                                                        Choose a product...
                                                    </option>
                                                    {products.map((product) => (
                                                        <option
                                                            key={product.id}
                                                            value={product.id}
                                                            className="bg-[#0f1117]"
                                                        >
                                                            {product.name}{" "}
                                                            {product.sku
                                                                ? `(${product.sku})`
                                                                : ""}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {selectedProduct && (
                                                <>
                                                    <div className="space-y-2">
                                                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                            Select Unit
                                                        </label>
                                                        <select
                                                            onChange={(e) =>
                                                                handleUnitSelect(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-amber-400/30"
                                                        >
                                                            <option
                                                                value=""
                                                                className="bg-[#0f1117]"
                                                            >
                                                                Choose a unit...
                                                            </option>
                                                            {availableUnits.map(
                                                                (unit) => (
                                                                    <option
                                                                        key={
                                                                            unit.id
                                                                        }
                                                                        value={
                                                                            unit.id
                                                                        }
                                                                        className="bg-[#0f1117]"
                                                                    >
                                                                        {
                                                                            unit.name
                                                                        }{" "}
                                                                        (
                                                                        {
                                                                            unit.code
                                                                        }
                                                                        ) -{" "}
                                                                        {formatCurrency(
                                                                            unit.price,
                                                                        )}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>

                                                    {selectedUnit && (
                                                        <>
                                                            <div className="space-y-2">
                                                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                                    Quantity
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    min="0.01"
                                                                    step="0.01"
                                                                    value={
                                                                        quantity
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleQuantityChange(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-amber-400/30"
                                                                />
                                                            </div>

                                                            <div className="md:col-span-2">
                                                                {calculatedPrice && (
                                                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div>
                                                                                <p className="text-xs text-slate-500">
                                                                                    Unit
                                                                                    Price
                                                                                </p>
                                                                                <p className="text-sm text-white/90">
                                                                                    {formatCurrency(
                                                                                        selectedUnit.price,
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-xs text-slate-500">
                                                                                    Subtotal
                                                                                </p>
                                                                                <p className="text-sm text-white/90">
                                                                                    {formatCurrency(
                                                                                        calculatedPrice.subtotal,
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                            {calculatedPrice.discount >
                                                                                0 && (
                                                                                <div>
                                                                                    <p className="text-xs text-slate-500">
                                                                                        Discount
                                                                                    </p>
                                                                                    <p className="text-sm text-emerald-400">
                                                                                        -
                                                                                        {formatCurrency(
                                                                                            calculatedPrice.discount,
                                                                                        )}
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                            <div>
                                                                                <p className="text-xs text-slate-500">
                                                                                    Total
                                                                                </p>
                                                                                <p className="text-lg font-semibold text-amber-400">
                                                                                    {formatCurrency(
                                                                                        calculatedPrice.total,
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <button
                                                                            type="button"
                                                                            onClick={
                                                                                addToCart
                                                                            }
                                                                            className="mt-4 w-full px-4 py-2 bg-amber-400/10 hover:bg-amber-400/15 border border-amber-400/20 rounded-lg text-amber-400 text-sm transition-all duration-200"
                                                                        >
                                                                            Add
                                                                            to
                                                                            Order
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Cart Items Card */}
                                {cartItems.length > 0 && (
                                    <div className="relative rounded-2xl bg-[#0f1117] border border-white/[0.06] overflow-hidden">
                                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                                        <div className="px-6 py-4 border-b border-white/[0.06]">
                                            <h3 className="text-sm font-semibold text-white/80">
                                                Order Items
                                            </h3>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-white/[0.06]">
                                                        <th className="px-6 py-3 text-left text-xs text-slate-500">
                                                            Product
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs text-slate-500">
                                                            Unit
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs text-slate-500">
                                                            Qty
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs text-slate-500">
                                                            Unit Price
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs text-slate-500">
                                                            Subtotal
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs text-slate-500">
                                                            Total
                                                        </th>
                                                        <th className="px-6 py-3 text-right text-xs text-slate-500">
                                                            Action
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/[0.06]">
                                                    {cartItems.map((item) => (
                                                        <tr
                                                            key={item.id}
                                                            className="hover:bg-white/[0.02]"
                                                        >
                                                            <td className="px-6 py-3">
                                                                <div>
                                                                    <p className="text-sm text-white/90">
                                                                        {
                                                                            item.product_name
                                                                        }
                                                                    </p>
                                                                    {item.product_sku && (
                                                                        <p className="text-xs text-slate-500">
                                                                            {
                                                                                item.product_sku
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <p className="text-sm text-slate-400">
                                                                    {
                                                                        item.unit_name
                                                                    }{" "}
                                                                    (
                                                                    {
                                                                        item.unit_code
                                                                    }
                                                                    )
                                                                </p>
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <input
                                                                    type="number"
                                                                    min="0.01"
                                                                    step="0.01"
                                                                    value={
                                                                        item.quantity
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateItemQuantity(
                                                                            item.id,
                                                                            parseFloat(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ) ||
                                                                                0,
                                                                        )
                                                                    }
                                                                    className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded text-sm text-white/80 focus:outline-none focus:border-amber-400/30"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <p className="text-sm text-slate-400">
                                                                    {formatCurrency(
                                                                        item.unit_price,
                                                                    )}
                                                                </p>
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <p className="text-sm text-white/80">
                                                                    {formatCurrency(
                                                                        item.subtotal,
                                                                    )}
                                                                </p>
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <p className="text-sm font-medium text-amber-400">
                                                                    {formatCurrency(
                                                                        item.total,
                                                                    )}
                                                                </p>
                                                            </td>
                                                            <td className="px-6 py-3 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeFromCart(
                                                                            item.id,
                                                                        )
                                                                    }
                                                                    className="p-1 text-slate-500 hover:text-red-400"
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
                                                                            strokeWidth={
                                                                                2
                                                                            }
                                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Order Summary */}
                            <div className="space-y-6">
                                <div className="relative rounded-2xl bg-[#0f1117] border border-white/[0.06] overflow-hidden sticky top-4">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

                                    <div className="px-6 py-4 border-b border-white/[0.06]">
                                        <h3 className="text-sm font-semibold text-white/80">
                                            Order Summary
                                        </h3>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        {/* Due Date Preview */}
                                        {data.order_due_date && (
                                            <div className="bg-amber-400/5 rounded-lg p-3 border border-amber-400/10">
                                                <p className="text-xs text-slate-500 mb-1">Due Date & Time</p>
                                                <p className="text-sm text-amber-400 font-medium">
                                                    {formatDateTime(data.order_due_date)}
                                                </p>
                                            </div>
                                        )}

                                        {/* Summary Details */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">
                                                    Subtotal
                                                </span>
                                                <span className="text-white/90">
                                                    {formatCurrency(
                                                        cartSubtotal,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                    Discount Amount
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={data.discount_amount}
                                                    onChange={(e) =>
                                                        setData(
                                                            "discount_amount",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:border-amber-400/30"
                                                />
                                            </div>

                                            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-white/[0.06]">
                                                <span className="text-slate-400">
                                                    Total
                                                </span>
                                                <span className="text-amber-400">
                                                    {formatCurrency(cartTotal)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Items Count */}
                                        <div className="bg-white/5 rounded-lg p-3 text-center">
                                            <p className="text-xs text-slate-500">
                                                Total Items
                                            </p>
                                            <p className="text-xl font-semibold text-white/90">
                                                {cartItems.length}
                                            </p>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={
                                                processing ||
                                                cartItems.length === 0 ||
                                                !data.order_due_date
                                            }
                                            className="w-full px-6 py-3 bg-amber-400/10 hover:bg-amber-400/15 border border-amber-400/20 rounded-xl text-amber-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processing ? (
                                                <div className="flex items-center justify-center gap-2">
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
                                                    <span>
                                                        Creating Order...
                                                    </span>
                                                </div>
                                            ) : (
                                                "Create Order"
                                            )}
                                        </button>

                                        <Link
                                            href={route("orders.index")}
                                            className="block w-full text-center px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-400 hover:text-slate-300 hover:bg-white/10 transition-all duration-200"
                                        >
                                            Cancel
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
