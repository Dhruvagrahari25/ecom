import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/${orderId}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="p-8 text-center">Loading order details...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Order not found</div>;

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const orderValue = order.items.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-green-700 hover:text-green-900 font-medium flex items-center gap-2"
        >
          ← Back to Orders
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
                <p className="text-sm text-gray-500 font-mono mt-1">ID: {order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Placed on</p>
                <p className="text-gray-800">{new Date(order.placedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Status & Info */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer Info</h3>
              <p className="font-medium text-gray-800">{order.user?.name || "User"}</p>
              <p className="text-gray-600 mt-1">{order.user?.address || "Address not provided"}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Delivery Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'ONGOING' ? 'bg-teal-100 text-teal-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.paymentstatus === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                    'bg-emerald-100 text-emerald-800'
                    }`}>
                    {order.paymentstatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Items ({totalItems})</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-medium text-gray-800">{item.product.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      ₹{item.product.price} × {item.quantity} {item.product.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">Total Amount</span>
              <span className="text-2xl font-bold text-gray-900">₹{orderValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
