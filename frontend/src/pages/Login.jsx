import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import api from "../services/api"; // Yeh line zaroori hai 3 hr ke baad bug mila
const Login = () => {
  const { login, loading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Login function ko call karein
    const res = await login(email, password);

    if (res.ok) {
      navigate("/dashboard");
    } else {
      // Yahan par naya logic
      if (res.inactive) {
        // Agar account inactive hai to confirmation poochein
        const confirmReactivate = window.confirm("Your account is currently inactive. Do you want to reactivate it?");
       
        if (confirmReactivate == true) {
          try {
            // Naye reactivate API ko call karein
            const reactivationRes = await api.post('/auth/reactivate', { email });
            alert(reactivationRes.data.message); // Success message dikhayein
            // Password field ko clear kar dein taaki user dobara login kare
            
          } catch (reactivateErr) {
            setError(reactivateErr.response?.data?.message || "Failed to reactivate account.");
          }
        } else {
          setError(res.message); // Agar user 'No' kehta hai to original message dikhayein
        }
      } else {
        // Baaki sabhi errors ke liye
        setError(res.message || "Login failed");
      }
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
        {error && <p className="text-red-500 mb-4">{error}</p>}
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
