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

    const { cartCount } = useCart();

    const navLinks = [];
    if (user) {
        if (user.type === "SELLER") {
            navLinks.push({ name: "Dashboard", path: "/seller/dashboard" });
            navLinks.push({ name: "My Items", path: "/seller/items" });
            navLinks.push({ name: "Add Item", path: "/seller/items/new" });
            navLinks.push({ name: "Orders", path: "/seller/orders" });
        } else {
            navLinks.push({ name: "Shop", path: "/items" });
            navLinks.push({ name: `Cart${cartCount > 0 ? ` (${cartCount})` : ""}`, path: "/cart" });
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

    return <Sidebar user={user} navLinks={navLinks} handleLogout={handleLogout} />;
}
