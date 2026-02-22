import { useEffect, useState } from "react";
import axios from "axios";

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:3000/sellers/items", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Sort products alphabetically by name
        const sortedProducts = res.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setProducts(sortedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <h2 className="text-base font-semibold text-gray-800 mb-1">{item.name}</h2>
            {item.description && (
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
            )}
            <p className="text-lg font-bold text-gray-900">₹{item.price}
              <span className="text-xs font-normal text-gray-400 ml-1">/ {item.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-gray-400 text-center mt-16">No products available.</p>
      )}
    </div>
  );
};

export default Products;
