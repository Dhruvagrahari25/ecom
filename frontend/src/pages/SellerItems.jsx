import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SellerItems = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  // Fetch all seller items
  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:3000/sellers/items", {
        withCredentials: true,
      });
      // Sort items alphabetically by name
      const sortedItems = res.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setItems(sortedItems);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  // Delete an item
  const deleteItem = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/sellers/items/${id}`, {
        withCredentials: true,
      });
      toast.success("Item deleted successfully");
      fetchItems(); // refresh list
    } catch (err) {
      console.error("Error deleting item:", err);
      if (err.response && err.response.data && err.response.data.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Failed to delete item");
      }
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">My Items</h1>
        <button
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
          onClick={() => navigate("/seller/items/new")}
        >
          + Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
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
              <p className="text-sm text-gray-500 mt-1">Cost: ₹{item.cost || 0}</p>
              <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${item.available ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'
                }`}>
                {item.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 py-1.5 text-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => navigate(`/seller/items/${item.id}/edit`)}
              >
                Edit
              </button>
              <button
                className="flex-1 py-1.5 text-sm font-medium border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                onClick={() => deleteItem(item.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-gray-400 text-center mt-16">No items found.</p>
      )}
    </div>
  );
};

export default SellerItems;
