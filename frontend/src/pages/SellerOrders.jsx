import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [buyerSearch, setBuyerSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  const filtered = orders.filter((order) => {
    const placed = new Date(order.placedAt);
    if (fromDate && placed < new Date(fromDate)) return false;
    if (toDate && placed > new Date(toDate + "T23:59:59")) return false;
    if (buyerSearch && !(order.user?.name || "").toLowerCase().includes(buyerSearch.toLowerCase())) return false;
    if (locationSearch && !(order.user?.address || "").toLowerCase().includes(locationSearch.toLowerCase())) return false;
    if (statusFilter && order.status !== statusFilter) return false;
    if (paymentFilter && order.paymentstatus !== paymentFilter) return false;
    return true;
  });

  const clearFilters = () => {
    setFromDate(""); setToDate("");
    setBuyerSearch(""); setLocationSearch("");
    setStatusFilter(""); setPaymentFilter("");
  };

  const hasActiveFilters = fromDate || toDate || buyerSearch || locationSearch || statusFilter || paymentFilter;

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const res = await api.get("/sellers/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/sellers/orders/${id}`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-5">Seller Orders</h1>

          {/* Filters */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-end">
            {/* Date range */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500 whitespace-nowrap">From</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200" />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200" />
            </div>
            {/* Buyer */}
            <input
              type="text" placeholder="Buyer name…" value={buyerSearch}
              onChange={(e) => setBuyerSearch(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 w-36"
            />
            {/* Location */}
            <input
              type="text" placeholder="Delivery location…" value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 w-44"
            />
            {/* Delivery status */}
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200">
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ONGOING">Ongoing</option>
              <option value="FULFILLED">Fulfilled</option>
            </select>
            {/* Payment status */}
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200">
              <option value="">All payments</option>
              <option value="PENDING">Unpaid</option>
              <option value="PAID">Paid</option>
            </select>
            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-gray-600 underline ml-1">
                Clear all
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-12 bg-white rounded-xl shadow-sm">
            {orders.length === 0 ? "No orders found." : "No orders match the selected filters."}
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
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full cursor-pointer hover:shadow-md transition-shadow"
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
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      <span className="font-medium">Delivery to:</span> {order.user?.address || "Address not provided"}
                    </p>
                    <div className="space-y-2">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.product.name} × {item.quantity}</span>
                          <span className="font-medium">₹{item.product.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-end pt-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">{totalItems}</span> {totalItems === 1 ? 'item' : 'items'}
                      </p>
                      <p className="text-lg font-bold text-gray-900">₹{orderValue.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <select
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-green-500 ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'ONGOING' ? 'bg-teal-100 text-teal-800' :
                            'bg-green-100 text-green-800'
                          }`}
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="ONGOING">ONGOING</option>
                        <option value="FULFILLED">FULFILLED</option>
                      </select>
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
};

export default SellerOrders;
