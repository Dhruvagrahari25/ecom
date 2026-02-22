import { useEffect, useState } from "react";
import axios from "axios";

const SellerDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await axios.get("http://localhost:3000/sellers/dashboard", {
                    withCredentials: true,
                });
                setDashboardData(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Failed to load dashboard data");
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 md:p-10 flex justify-center items-center">
                <p className="text-gray-500">Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 md:p-10 flex justify-center items-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Seller Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Total Monthly Orders */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Total Monthly Orders</h2>
                    <p className="text-3xl font-bold text-gray-900">{dashboardData.totalMonthlyOrders}</p>
                </div>

                {/* Total Monthly Order Value */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Total Monthly Order Value</h2>
                    <p className="text-3xl font-bold text-gray-900">₹{dashboardData.totalMonthlyOrderValue.toFixed(2)}</p>
                </div>

                {/* Total Profits Made */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Total Profits Made (All Time)</h2>
                    <p className="text-3xl font-bold text-green-600">₹{dashboardData.totalProfitsMade.toFixed(2)}</p>
                </div>

                {/* Avg Profit Percentage */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Avg Profit Percentage</h2>
                    <p className="text-3xl font-bold text-blue-600">{dashboardData.avgProfitPercentage.toFixed(2)}%</p>
                </div>

                {/* Avg Order Value */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Avg Order Value</h2>
                    <p className="text-3xl font-bold text-gray-900">₹{dashboardData.avgOrderValue.toFixed(2)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Most Ordered Item */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Most Ordered Item</h2>
                    {dashboardData.mostOrderedItem ? (
                        <div>
                            <p className="text-xl font-medium text-gray-900">{dashboardData.mostOrderedItem.name}</p>
                            <p className="text-sm text-gray-500 mt-1">Ordered {dashboardData.mostOrderedItem.quantity} times</p>
                        </div>
                    ) : (
                        <p className="text-gray-500">No data available</p>
                    )}
                </div>

                {/* Least Ordered Item */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Least Ordered Item</h2>
                    {dashboardData.leastOrderedItem ? (
                        <div>
                            <p className="text-xl font-medium text-gray-900">{dashboardData.leastOrderedItem.name}</p>
                            <p className="text-sm text-gray-500 mt-1">Ordered {dashboardData.leastOrderedItem.quantity} times</p>
                        </div>
                    ) : (
                        <p className="text-gray-500">No data available</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
