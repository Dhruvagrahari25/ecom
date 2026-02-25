import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png";

export default function Navbar({ user, navLinks, handleLogout }) {
  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2">
            <Link to={user ? (user.type === "SELLER" ? "/seller/items" : "/items") : "/"} className="flex items-center gap-2 text-xl font-bold">
              <img src={logo} alt="SMA Traders" className="h-9 w-9 object-cover" />
              SMA Traders
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="hover:bg-green-800 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
