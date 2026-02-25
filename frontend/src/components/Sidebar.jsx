import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { useCart } from "../context/CartContext";

export default function Sidebar({ user, navLinks, handleLogout }) {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { cartItemCount } = useCart();

    const toggleSidebar = () => setIsOpen(!isOpen);

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-green-700 text-white shadow-md h-16 flex items-center px-4 z-40">
                <button onClick={toggleSidebar} className="text-white focus:outline-none p-1 rounded hover:bg-green-600 transition shrink-0">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div className="absolute left-1/2 -translate-x-1/2">
                    <Link to={user ? (user.type === "SELLER" ? "/seller/items" : "/items") : "/"} className="flex items-center gap-2 text-xl font-bold tracking-tight">
                        <img src={logo} alt="SMA Traders" className="h-9 w-9 object-cover" />
                        SMA Traders
                    </Link>
                </div>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-40 z-40"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Panel */}
            <div className={`fixed top-0 left-0 h-full w-64 bg-gray-50 border-r border-gray-200 shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out z-50 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

                {/* Header */}
                <div className="h-16 px-5 bg-green-700 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="SMA Traders" className="h-8 w-8 object-cover" />
                        <span className="text-xl font-bold tracking-tight">SMA Traders</span>
                    </div>
                    <button onClick={toggleSidebar} className="md:hidden text-white focus:outline-none p-1 rounded hover:bg-green-600 transition">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                                ? "bg-green-100 text-green-800 font-semibold"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                        >
                            <span className="flex items-center">
                                {isActive(link.path) && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-2.5 shrink-0" />
                                )}
                                {link.name}
                            </span>
                            {link.name === "Cart" && (link.count ?? cartItemCount) > 0 && (
                                <span className="ml-2 min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
                                    {link.count ?? cartItemCount}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Logout pinned at bottom */}
                {user && (
                    <div className="px-3 py-4 border-t border-gray-200 shrink-0">
                        <button
                            onClick={() => { handleLogout(); setIsOpen(false); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
