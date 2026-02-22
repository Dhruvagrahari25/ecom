import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const navigate = useNavigate();

    // Subscription modal state
    const [showSubModal, setShowSubModal] = useState(false);
    const [subForm, setSubForm] = useState({ name: "", frequency: "DAILY", dayOfWeek: 0, hour: 8, minute: 0 });
    const [savingSub, setSavingSub] = useState(false);

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/orders`,
                {
                    items: cart.map((i) => ({ productId: i.id, quantity: i.quantity })),
                },
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            clearCart();
            navigate("/orders");
        } catch (err) {
            console.error("Error placing order:", err);
            toast.error("Failed to place order. Please try again.");
        }
    };

    const handleSaveAsSubscription = async (e) => {
        e.preventDefault();
        setSavingSub(true);
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/subscriptions`,
                {
                    ...subForm,
                    hour: Number(subForm.hour),
                    minute: Number(subForm.minute),
                    dayOfWeek: subForm.frequency === "WEEKLY" ? Number(subForm.dayOfWeek) : undefined,
                    items: cart.map((i) => ({ productId: i.id, quantity: i.quantity })),
                },
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            setShowSubModal(false);
            toast.success("Subscription created! Manage it from the Subscriptions page.");
        } catch (err) {
            console.error("Error creating subscription:", err);
            toast.error("Failed to create subscription.");
        } finally {
            setSavingSub(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-400 text-lg">Your cart is empty.</p>
                <button
                    onClick={() => navigate("/items")}
                    className="px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Browse Products
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Your Cart</h1>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                    {cart.map((item, index) => (
                        <div
                            key={item.id}
                            className={`flex items-center gap-4 p-5 ${index !== cart.length - 1 ? "border-b border-gray-100" : ""
                                }`}
                        >
                            {/* Item Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">{item.name}</p>
                                <p className="text-sm text-gray-400">
                                    ₹{item.price} / {item.unit}
                                </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-lg leading-none"
                                >
                                    −
                                </button>
                                <span className="w-8 text-center text-sm font-medium text-gray-800">
                                    {item.quantity}
                                </span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-lg leading-none"
                                >
                                    +
                                </button>
                            </div>

                            {/* Line Total */}
                            <p className="w-20 text-right font-semibold text-gray-900 text-sm">
                                ₹{(item.price * item.quantity).toFixed(2)}
                            </p>

                            {/* Remove */}
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-gray-300 hover:text-red-400 transition-colors ml-2 text-lg leading-none"
                                title="Remove"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
                    <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
                        <span>{cart.reduce((s, i) => s + i.quantity, 0)} items</span>
                        <span>{cart.length} products</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-base font-semibold text-gray-700">Total</span>
                        <span className="text-xl font-bold text-gray-900">₹{cartTotal.toFixed(2)}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mb-3">
                    <button
                        onClick={clearCart}
                        className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        Clear Cart
                    </button>
                    <button
                        onClick={handlePlaceOrder}
                        className="flex-1 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Place Order
                    </button>
                </div>
                <button
                    onClick={() => setShowSubModal(true)}
                    className="w-full py-2.5 text-sm font-medium border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                    ↻ Save as Recurring Subscription
                </button>
            </div>

            {/* Subscription Modal */}
            {showSubModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Save as Subscription</h2>
                        <form onSubmit={handleSaveAsSubscription} className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Subscription Name</label>
                                <input
                                    required
                                    value={subForm.name}
                                    onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                                    placeholder="e.g. Weekly Groceries"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Frequency</label>
                                <select
                                    value={subForm.frequency}
                                    onChange={(e) => setSubForm({ ...subForm, frequency: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    <option value="DAILY">Every day</option>
                                    <option value="WEEKLY">Every week</option>
                                </select>
                            </div>
                            {subForm.frequency === "WEEKLY" && (
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Day of Week</label>
                                    <select
                                        value={subForm.dayOfWeek}
                                        onChange={(e) => setSubForm({ ...subForm, dayOfWeek: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    >
                                        {DAY_NAMES.map((day, i) => (
                                            <option key={day} value={i}>{day}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-500 mb-1">Hour (0–23)</label>
                                    <input
                                        type="number" min={0} max={23}
                                        value={subForm.hour}
                                        onChange={(e) => setSubForm({ ...subForm, hour: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-500 mb-1">Minute (0–59)</label>
                                    <input
                                        type="number" min={0} max={59}
                                        value={subForm.minute}
                                        onChange={(e) => setSubForm({ ...subForm, minute: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">
                                An order will be placed automatically at this time with your current cart items.
                            </p>
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowSubModal(false)}
                                    className="flex-1 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSub}
                                    className="flex-1 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                                >
                                    {savingSub ? "Saving…" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
