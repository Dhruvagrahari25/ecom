import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const AllItems = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();

  const getCartItem = (id) => cart.find((i) => i.id === id);

  // Fetch all items
  const fetchItems = async () => {
    try {
      const res = await api.get("/sellers/items");
      // Sort items alphabetically by name
      const sortedItems = res.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setItems(sortedItems);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-1">{item.name}</h2>
              {item.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
              )}
              <p className="text-lg font-bold text-gray-900">₹{item.price}
                <span className="text-xs font-normal text-gray-400 ml-1">/ {item.unit}</span>
              </p>
            </div>
            {!item.available ? (
              <button disabled className="mt-4 w-full py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed">
                Unavailable
              </button>
            ) : getCartItem(item.id) ? (
              <div className="mt-4 flex items-center justify-between border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => updateQuantity(item.id, getCartItem(item.id).quantity - 1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors text-lg leading-none"
                >
                  −
                </button>
                <span className="text-sm font-semibold text-gray-800">{getCartItem(item.id).quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, getCartItem(item.id).quantity + 1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors text-lg leading-none"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(item)}
                className="mt-4 w-full py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors"
              >
                Add to Cart
              </button>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-400 text-center mt-16">
          {search ? `No products match "${search}".` : "No products available."}
        </p>
      )}
    </div>
  );
};

export default AllItems;
