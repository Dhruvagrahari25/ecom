import { useEffect, useState } from "react";
import api from "../utils/api";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = orders.filter((order) => {
    const placed = new Date(order.placedAt);
    if (fromDate && placed < new Date(fromDate)) return false;
    if (toDate && placed > new Date(toDate + "T23:59:59")) return false;
    return true;
  });

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">My Orders</h1>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-gray-500">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <label className="text-sm text-gray-500">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          {(fromDate || toDate) && (
            <button
              onClick={() => { setFromDate(""); setToDate(""); }}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <table className="w-full border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2 text-left">Order Details</th>
            <th className="border p-2 text-left">Items</th>
            <th className="border p-2 text-left">Total Price</th>
            <th className="border p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((order) => {
            const totalPrice = order.items?.reduce(
              (sum, item) => sum + item.quantity * (item.product?.price || 0),
              0
            ) || 0;

            return (
              <tr key={order.id}>
                <td className="border p-2">
                  <div className="text-sm font-mono text-gray-600" title={order.id}>
                    {order.id.split('-')[0]}...
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(order.placedAt).toLocaleString()}
                  </div>
                </td>
                <td className="border p-2">
                  <ul className="list-disc list-inside space-y-1">
                    {order.items?.map((item) => (
                      <li key={item.id} className="text-sm">
                        <span className="font-medium">{item.product?.name || "Unknown Item"}</span>{" "}
                        <span className="text-gray-600">
                          (x{item.quantity} {item.product?.unit})
                        </span>{" "}
                        - ₹{item.product?.price * item.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="border p-2 font-semibold text-green-700">
                  ₹{totalPrice}
                </td>
                <td className="border p-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Order:</span>{" "}
                    <span className={`px-2 py-0.5 rounded text-xs ${order.status === 'FULFILLED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="font-semibold text-gray-700">Payment:</span>{" "}
                    <span className={`px-2 py-0.5 rounded text-xs ${order.paymentstatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {order.paymentstatus}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <p className="text-gray-500 text-center mt-4">
          {orders.length === 0 ? "You have no orders." : "No orders match the selected dates."}
        </p>
      )}
    </div>
  );
};

export default UserOrders;
