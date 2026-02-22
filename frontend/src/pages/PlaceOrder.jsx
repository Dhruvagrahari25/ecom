import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { id } = useParams(); // product ID
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const fetchItem = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/sellers/items/${id}`, {
        withCredentials: true,
      });
      setItem(res.data);
    } catch (err) {
      console.error("Error fetching item:", err);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  // Place order
  const handleOrder = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:3000/orders",
        { itemId: id, quantity: Number(quantity) },
        { withCredentials: true }
      );
      navigate("/orders"); // go to user orders page
    } catch (err) {
      console.error("Error placing order:", err);
    }
  };

  if (!item) return <p className="p-6">Loading product...</p>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Place Order</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">{item.name}</h2>
        <p>Price: ₹{item.price}</p>
        <p>Unit: {item.unit}</p>
        {item.description && <p>Description: {item.description}</p>}
      </div>

      <form onSubmit={handleOrder} className="space-y-4">
        <div>
          <label className="block mb-1">Quantity:</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded"
          disabled={!item.available}
        >
          Place Order
        </button>
      </form>
    </div>
  );
};

export default PlaceOrder;
