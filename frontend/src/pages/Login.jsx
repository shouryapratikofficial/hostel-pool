import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import api from "../services/api";
import toast from 'react-hot-toast'; // 1. toast ko import karein

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [error, setError] = useState(""); // 2. Ab iski zaroorat nahi
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
    setLoading(true);
    const toastId = toast.loading('Logging in...'); // 3. Loading toast dikhayein

    try {
      const { data } = await api.post('/auth/login', { email, password });
      dispatch(setCredentials(data));
      toast.success('Login successful!', { id: toastId }); // 4. Success toast
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage, { id: toastId }); // 5. Error toast

      if (err.response?.data?.inactive) {
        if (window.confirm("Your account is currently inactive. Do you want to reactivate it?")) {
            const reactivationToastId = toast.loading('Reactivating account...');
            try {
                const reactivationRes = await api.post('/auth/reactivate', { email });
                toast.success(reactivationRes.data.message, { id: reactivationToastId });
            } catch (reactivateErr) {
                const reactivateError = reactivateErr.response?.data?.message || "Failed to reactivate account.";
                toast.error(reactivateError, { id: reactivationToastId });
            }
        }
      }
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
          <h2 className="text-3xl font-bold text-white">Login</h2>
        </div>
        {/* Error message p tag ab hata diya gaya hai */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-sm text-center mt-6 text-slate-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;