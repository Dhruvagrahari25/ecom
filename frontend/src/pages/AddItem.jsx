import { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const AddItem = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [unit, setUnit] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        "/sellers/items",
        { name, price: Number(price), cost: Number(cost), unit, description, imageUrl: imageUrl || "https://placehold.co/400" }
      );
      navigate("/seller/items"); // go back to items list
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Item</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Name:</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Price:</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Cost:</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Unit (e.g., KG, PCS):</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Description:</label>
          <textarea
            className="w-full border p-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">Image URL:</label>
          <input
            type="url"
            className="w-full border p-2 rounded"
            placeholder="https://placehold.co/400"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="mt-2 h-32 w-full object-cover rounded border"
              onError={(e) => { e.target.src = "https://placehold.co/400"; }}
            />
          )}
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-colors"
        >
          Add Item
        </button>
      </form>
    </div>
  );
};

export default AddItem;
