import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DEFAULT_FORM = {
    name: "",
    frequency: "DAILY",
    dayOfWeek: 0,
    hour: 8,
    minute: 0,
};

const EditSubscription = () => {
    const { id } = useParams(); // "new" or a subscription UUID
    const isNew = id === "new";
    const navigate = useNavigate();

    const [form, setForm] = useState(DEFAULT_FORM);
    const [items, setItems] = useState([]); // [{ productId, quantity, product }]
    const [allProducts, setAllProducts] = useState([]);
    const [addProductId, setAddProductId] = useState("");
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    // Load existing subscription
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get("/sellers/items");
                const sorted = res.data
                    .filter((p) => p.available)
                    .sort((a, b) => a.name.localeCompare(b.name));
                setAllProducts(sorted);
                if (sorted.length) setAddProductId(sorted[0].id);
            } catch (err) {
                console.error("Error fetching products:", err);
            }
        };
        fetchProducts();

        if (!isNew) {
            const fetchSub = async () => {
                try {
                    const res = await api.get(`/subscriptions/${id}`);
                    const sub = res.data;
                    setForm({
                        name: sub.name,
                        frequency: sub.frequency,
                        dayOfWeek: sub.dayOfWeek ?? 0,
                        hour: sub.hour,
                        minute: sub.minute,
                    });
                    setItems(
                        sub.items.map((i) => ({
                            productId: i.productId,
                            quantity: i.quantity,
                            product: i.product,
                        }))
                    );
                } catch (err) {
                    console.error("Error fetching subscription:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchSub();
        }
    }, [id, isNew]);

    const addProduct = () => {
        if (!addProductId) return;
        if (items.find((i) => i.productId === addProductId)) return; // already in list
        const product = allProducts.find((p) => p.id === addProductId);
        if (!product) return;
        setItems((prev) => [...prev, { productId: addProductId, quantity: 1, product }]);
    };

    const updateQty = (productId, qty) => {
        if (qty < 1) {
            setItems((prev) => prev.filter((i) => i.productId !== productId));
            return;
        }
        setItems((prev) =>
            prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
        );
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (items.length === 0) {
            toast.error("Add at least one product to the subscription.");
            return;
        }
        setSaving(true);
        const payload = {
            ...form,
            hour: Number(form.hour),
            minute: Number(form.minute),
            dayOfWeek: form.frequency === "WEEKLY" ? Number(form.dayOfWeek) : undefined,
            items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        };

        try {
            if (isNew) {
                await api.post("/subscriptions", payload);
            } else {
                await api.patch(`/subscriptions/${id}`, payload);
            }
            navigate("/subscriptions");
        } catch (err) {
            console.error("Error saving subscription:", err);
            toast.error("Failed to save subscription.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

    const totalValue = items.reduce((s, i) => s + i.quantity * i.product.price, 0);
    const unusedProducts = allProducts.filter((p) => !items.find((i) => i.productId === p.id));

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-xl mx-auto">
                <button
                    onClick={() => navigate("/subscriptions")}
                    className="mb-6 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                    ← Back to Subscriptions
                </button>

                <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                    {isNew ? "New Subscription" : "Edit Subscription"}
                </h1>

                <form onSubmit={handleSave} className="space-y-5">
                    {/* Name */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Weekly Groceries"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                    </div>

                    {/* Schedule */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-gray-700">Schedule</h2>

                        {/* Frequency */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Frequency</label>
                            <select
                                value={form.frequency}
                                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                <option value="DAILY">Daily</option>
                                <option value="WEEKLY">Weekly</option>
                            </select>
                        </div>

                        {/* Day of week (weekly only) */}
                        {form.frequency === "WEEKLY" && (
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Day of Week</label>
                                <select
                                    value={form.dayOfWeek}
                                    onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    {DAY_NAMES.map((day, i) => (
                                        <option key={day} value={i}>{day}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Time */}
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Hour (0–23)</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={23}
                                    value={form.hour}
                                    onChange={(e) => setForm({ ...form, hour: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Minute (0–59)</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={59}
                                    value={form.minute}
                                    onChange={(e) => setForm({ ...form, minute: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">Products</h2>

                        {items.length === 0 ? (
                            <p className="text-sm text-gray-400 mb-3">No products added yet.</p>
                        ) : (
                            <div className="space-y-2 mb-4">
                                {items.map((item) => (
                                    <div key={item.productId} className="flex items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
                                            <p className="text-xs text-gray-400">₹{item.product.price} / {item.product.unit}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => updateQty(item.productId, item.quantity - 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 text-base leading-none"
                                            >
                                                −
                                            </button>
                                            <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateQty(item.productId, item.quantity + 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 text-base leading-none"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <p className="w-16 text-right text-sm font-semibold text-gray-700">
                                            ₹{(item.product.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-semibold text-gray-700">
                                    <span>Total / order</span>
                                    <span>₹{totalValue.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        {/* Add product row */}
                        {unusedProducts.length > 0 && (
                            <div className="flex gap-2">
                                <select
                                    value={addProductId}
                                    onChange={(e) => setAddProductId(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    {unusedProducts.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} — ₹{p.price}/{p.unit}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={addProduct}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    + Add
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? "Saving…" : isNew ? "Create Subscription" : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditSubscription;
