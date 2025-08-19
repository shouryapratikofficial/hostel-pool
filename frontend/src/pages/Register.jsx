import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import api from '../services/api';
import { registerUser } from '../services/authService'; // Naya import


const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        if (userInfo) {
            navigate("/dashboard");
        }
    }, [userInfo, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setLoading(false);
            return;
        }
        try {
            await registerUser(name, email, password);
           
            navigate('/verify-otp', { state: { email } });
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="max-w-md w-full bg-slate-900 p-8 rounded-xl shadow-lg border border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <Link to="/" className="text-xl font-bold tracking-wide text-indigo-400 hover:text-indigo-300 transition">
                        <ArrowLeftIcon className="h-6 w-6 inline-block mr-2" />
                        HostelPool
                    </Link>
                    <h2 className="text-3xl font-bold text-white">Register</h2>
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full border border-slate-700 bg-slate-800 text-white rounded-lg px-4 py-3 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full border border-slate-700 bg-slate-800 text-white rounded-lg px-4 py-3 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full border border-slate-700 bg-slate-800 text-white rounded-lg px-4 py-3 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition font-semibold text-lg"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
                <p className="text-sm text-center mt-6 text-slate-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-indigo-400 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;