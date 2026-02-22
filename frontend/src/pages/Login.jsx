import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { phone, password }, { withCredentials: true });
        console.log(res.data);
        localStorage.setItem("token", res.data.token);
        toast.success("Login successful");
        const userType = res.data.user?.type;
        navigate(userType === "SELLER" ? "/seller/dashboard" : "/items");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter your phone number"
                            onChange={e => setPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter your password"
                            type="password"
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        className="w-full bg-green-700 text-white py-2 px-4 rounded-md hover:bg-green-800 transition duration-200 font-medium"
                        type="submit"
                    >
                        Login
                    </button>
                </form>
                <p className="mt-5 text-center text-sm text-gray-500">
                    New here?{" "}
                    <Link to="/signup" className="text-green-700 font-medium hover:underline">Sign Up</Link>
                </p>
            </div>
        </div>
    );
}
