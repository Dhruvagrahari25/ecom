import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import Sidebar from "./Sidebar";
import { useCart } from "../context/CartContext";

export default function Navigation() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchProfile = async () => {
            const currentToken = localStorage.getItem("token");
            if (!currentToken) {
                setUser(null);
                return;
            }
            try {
                const res = await api.get("/users/profile");
                setUser(res.data);
            } catch (err) {
                console.error("Error fetching profile:", err);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem("token");
                    setUser(null);
                }
            }
        };
        fetchProfile();
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    const { cartItemCount } = useCart();

    const navLinks = [];
    if (user) {
        if (user.type === "SELLER") {
            navLinks.push({ name: "Dashboard", path: "/seller/dashboard" });
            navLinks.push({ name: "My Items", path: "/seller/items" });
            navLinks.push({ name: "Add Item", path: "/seller/items/new" });
            navLinks.push({ name: "Orders", path: "/seller/orders" });
        } else {
            navLinks.push({ name: "Shop", path: "/items" });
            navLinks.push({ name: "Cart", path: "/cart", count: cartItemCount });
            navLinks.push({ name: "Subscriptions", path: "/subscriptions" });
            navLinks.push({ name: "My Orders", path: "/orders" });
        }
        navLinks.push({ name: "Profile", path: "/profile" });
    } else {
        navLinks.push({ name: "Login", path: "/" });
        navLinks.push({ name: "Sign Up", path: "/signup" });
    }

    const AUTH_PATHS = ["/", "/signup"];
    if (AUTH_PATHS.includes(location.pathname)) return null;

    const showCartFab = user && user.type !== "SELLER" && location.pathname !== "/cart";

    return (
        <>
            <Sidebar user={user} navLinks={navLinks} handleLogout={handleLogout} />
            {showCartFab && (
                <button
                    onClick={() => navigate("/cart")}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-700 text-white shadow-lg hover:bg-green-800 active:scale-95 transition-all flex items-center justify-center"
                    aria-label="Go to cart"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                    {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold leading-none">
                            {cartItemCount}
                        </span>
                    )}
                </button>
            )}
        </>
    );
}
