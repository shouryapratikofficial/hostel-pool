import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { verifyOtp } from '../services/authService'; // We'll create this next
import toast from 'react-hot-toast';

const VerifyOtp = () => {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const email = location.state?.email; // Get email from the navigation state

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Verifying OTP...');

        try {
            const data = await verifyOtp(email, otp);
            dispatch(setCredentials(data));
            toast.success('Verification successful! Welcome!', { id: toastId });
            navigate("/dashboard");
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Verification failed. Please try again.";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        // Redirect to register page if email is not available
        navigate('/register');
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="max-w-md w-full bg-slate-900 p-8 rounded-xl shadow-lg border border-slate-800">
                <h2 className="text-3xl font-bold text-white text-center mb-6">Enter OTP</h2>
                <p className="text-center text-slate-400 mb-4">An OTP has been sent to {email}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="6-digit OTP"
                        className="w-full border border-slate-700 bg-slate-800 text-white rounded-lg px-4 py-3 text-center tracking-[1em]"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength="6"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition font-semibold text-lg"
                    >
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyOtp;