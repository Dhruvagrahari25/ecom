import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Subscriptions = () => {
    const [subs, setSubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchSubs = async () => {
        try {
            const res = await api.get("/subscriptions");
            setSubs(res.data);
        } catch (err) {
            console.error("Error fetching subscriptions:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (sub) => {
        try {
            const res = await api.patch(`/subscriptions/${sub.id}`, { active: !sub.active });
            setSubs((prev) => prev.map((s) => (s.id === sub.id ? res.data : s)));
        } catch (err) {
            console.error("Error toggling subscription:", err);
        }
    };

    const deleteSub = async (id) => {
        if (!confirm("Delete this subscription?")) return;
        try {
            await api.delete(`/subscriptions/${id}`);
            setSubs((prev) => prev.filter((s) => s.id !== id));
        } catch (err) {
            console.error("Error deleting subscription:", err);
        }
    };

    useEffect(() => {
        fetchSubs();
    }, []);

    const scheduleLabel = (sub) => {
        const time = `${String(sub.hour).padStart(2, "0")}:${String(sub.minute).padStart(2, "0")}`;
        if (sub.frequency === "DAILY") return `Every day at ${time}`;
        return `Every ${DAY_NAMES[sub.dayOfWeek ?? 0]} at ${time}`;
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading subscriptions...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Subscriptions</h1>
                    <button
                        onClick={() => navigate("/subscriptions/new")}
                        className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        + New Subscription
                    </button>
                </div>

                {subs.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
                        <p className="text-gray-400 mb-4">No subscriptions yet.</p>
                        <p className="text-sm text-gray-400">
                            You can create one directly or save your cart as a subscription from the cart page.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {subs.map((sub) => {
                            const totalItems = sub.items.reduce((s, i) => s + i.quantity, 0);
                            const totalValue = sub.items.reduce(
                                (s, i) => s + i.quantity * i.product.price,
                                0
                            );
                            return (
                                <div
                                    key={sub.id}
                                    className={`bg-white rounded-xl border shadow-sm p-5 transition-opacity ${sub.active ? "border-gray-100" : "border-gray-100 opacity-60"
                                        }`}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        {/* Left: info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-800 truncate">{sub.name}</h3>
                                                <span
                                                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${sub.active
                                                        ? "bg-green-50 text-green-700"
                                                        : "bg-gray-100 text-gray-400"
                                                        }`}
                                                >
                                                    {sub.active ? "Active" : "Paused"}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-3">{scheduleLabel(sub)}</p>

                                            {/* Items preview */}
                                            <div className="space-y-1">
                                                {sub.items.map((item) => (
                                                    <div key={item.id} className="flex justify-between text-sm text-gray-600">
                                                        <span>
                                                            {item.product.name} × {item.quantity} {item.product.unit}
                                                        </span>
                                                        <span className="text-gray-400">
                                                            ₹{(item.product.price * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                                                <span>{totalItems} items</span>
                                                <span className="font-medium text-gray-600">₹{totalValue.toFixed(2)} / order</span>
                                                <span>
                                                    Next:{" "}
                                                    {new Date(sub.nextRunAt).toLocaleString([], {
                                                        dateStyle: "medium",
                                                        timeStyle: "short",
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right: actions */}
                                        <div className="flex flex-col gap-2 items-end shrink-0">
                                            {/* Toggle */}
                                            <button
                                                onClick={() => toggleActive(sub)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${sub.active ? "bg-gray-900" : "bg-gray-200"
                                                    }`}
                                                title={sub.active ? "Pause subscription" : "Resume subscription"}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sub.active ? "translate-x-6" : "translate-x-1"
                                                        }`}
                                                />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/subscriptions/${sub.id}/edit`)}
                                                className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteSub(sub.id)}
                                                className="text-xs text-red-400 hover:text-red-600 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Subscriptions;
