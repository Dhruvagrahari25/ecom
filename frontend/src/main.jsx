import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import { CartProvider } from "./context/CartContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Products from "./pages/Products";

// Seller Pages
import SellerDashboard from "./pages/SellerDashboard";
import SellerOrders from "./pages/SellerOrders";
import SellerItems from "./pages/SellerItems";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";

// User Pages
import AllItems from "./pages/AllItems";
import PlaceOrder from "./pages/PlaceOrder";
import UserOrders from "./pages/UserOrders";
import Cart from "./pages/Cart";
import Subscriptions from "./pages/Subscriptions";
import EditSubscription from "./pages/EditSubscription";

import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/Navigation";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    <CartProvider>
      <AppShell />
    </CartProvider>
  </BrowserRouter>
);

function AppShell() {
  const location = useLocation();
  const isAuthPage = ["/", "/signup"].includes(location.pathname);
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navigation />
      <div className={`flex-1 ${isAuthPage ? "" : "md:ml-64 pt-16 md:pt-0"}`}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* User routes */}
          <Route
            path="/items"
            element={
              <ProtectedRoute>
                <AllItems />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items/:id/order"
            element={
              <ProtectedRoute>
                <PlaceOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <Subscriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions/new"
            element={
              <ProtectedRoute>
                <EditSubscription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions/:id/edit"
            element={
              <ProtectedRoute>
                <EditSubscription />
              </ProtectedRoute>
            }
          />

          {/* Seller routes */}
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <ProtectedRoute>
                <SellerOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/items"
            element={
              <ProtectedRoute>
                <SellerItems />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/items/new"
            element={
              <ProtectedRoute>
                <AddItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/items/:id/edit"
            element={
              <ProtectedRoute>
                <EditItem />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
