import { useEffect, useState } from "react";
import api from "../utils/api";
import { useParams, useNavigate } from "react-router-dom";

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState({
    name: "",
    price: "",
    cost: "",
    unit: "",
    description: "",
  });

  // Fetch existing item details
  const fetchItem = async () => {
    try {
      const res = await api.get(`/sellers/items/${id}`);
      setItem({
        name: res.data.name,
        price: res.data.price,
        cost: res.data.cost || 0,
        unit: res.data.unit,
        description: res.data.description || "",
      });
    } catch (err) {
      console.error("Error fetching item:", err);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  // Update item
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(
        `/sellers/items/${id}`,
        {
          name: item.name,
          price: Number(item.price),
          cost: Number(item.cost),
          unit: item.unit,
          description: item.description,
        }
      );
      navigate("/seller/items"); // go back to items list
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Item</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Name:</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={item.name}
            onChange={(e) => setItem({ ...item, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Price:</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={item.price}
            onChange={(e) => setItem({ ...item, price: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Cost:</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={item.cost}
            onChange={(e) => setItem({ ...item, cost: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Unit (e.g., KG, PCS):</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={item.unit}
            onChange={(e) => setItem({ ...item, unit: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Description:</label>
          <textarea
            className="w-full border p-2 rounded"
            value={item.description}
            onChange={(e) => setItem({ ...item, description: e.target.value })}
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Update Item
        </button>
      </form>
    </div>
  );
};

export default EditItem;
