import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const filtered = orders.filter((order) => {
    const placed = new Date(order.placedAt);
    if (fromDate && placed < new Date(fromDate)) return false;
    if (toDate && placed > new Date(toDate + "T23:59:59")) return false;
    if (statusFilter && order.status !== statusFilter) return false;
    if (paymentFilter && order.paymentstatus !== paymentFilter) return false;
    return true;
  });

  const hasActiveFilters = fromDate || toDate || statusFilter || paymentFilter;
  const clearFilters = () => { setFromDate(""); setToDate(""); setStatusFilter(""); setPaymentFilter(""); };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-5">My Orders</h2>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-end">
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500 whitespace-nowrap">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200">
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ONGOING">Ongoing</option>
              <option value="FULFILLED">Fulfilled</option>
            </select>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200">
              <option value="">All payments</option>
              <option value="PENDING">Unpaid</option>
              <option value="PAID">Paid</option>
            </select>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-600 underline ml-1">
                Clear all
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-12 bg-white rounded-xl shadow-sm">
            {orders.length === 0 ? "You haven't placed any orders yet." : "No orders match the selected filters."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((order) => {
              const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
              const orderValue = order.items.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);

              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-gray-400 font-mono mb-1">ID: {order.id}</p>
                      <h3 className="text-lg font-semibold text-gray-800">{order.user?.name || "User"}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(order.placedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 flex-grow">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      <span className="font-medium">Delivery to:</span> {order.user?.address || "Address not provided"}
                    </p>
                  </div>

                  <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">{totalItems}</span> {totalItems === 1 ? 'item' : 'items'}
                      </p>
                      <p className="text-lg font-bold text-gray-900">₹{orderValue.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'ONGOING' ? 'bg-teal-100 text-teal-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        Delivery: {order.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.paymentstatus === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                        'bg-emerald-100 text-emerald-800'
                        }`}>
                        Payment: {order.paymentstatus}
                      </span>
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
}
