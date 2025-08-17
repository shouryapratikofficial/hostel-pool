import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from '../store/authSlice';
import api from "../services/api";
import toast from 'react-hot-toast';
import { getDashboardData, withdrawBalance, deactivateAccount } from '../services/userService';

// This sub-component handles its own local state, so it doesn't need many changes.
function WithdrawalForm({ currentBalance, onWithdrawal }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
        const toastId = toast.loading('Processing withdrawal...');

    try {
      const { data } = await withdrawBalance(parseInt(amount));
      toast.success(data.message, { id: toastId });
      setAmount("");
      onWithdrawal(); // Refresh dashboard data
    } catch (err) {
      toast.error(err.response?.data?.message || "Withdrawal failed.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="text-lg font-bold mb-4">Withdraw Balance</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="number"
          placeholder={`Your balance: ₹${currentBalance}`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded-lg px-3 py-2 flex-1"
          disabled={loading}
          required
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 disabled:opacity-50"
          disabled={loading || !amount}
        >
          {loading ? "Processing..." : "Withdraw"}
        </button>
      </form>
    </div>
  );
}

// This sub-component needs to use Redux to dispatch the logout action.
function AccountActions() {
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  
   const handleDeactivate = async () => {
    if (window.confirm("Are you sure you want to deactivate your account? This action cannot be undone.")) {
      const toastId = toast.loading('Deactivating account...');
      try {
        const { data } = await deactivateAccount();
        toast.success(`${data.message} A total of ₹${data.returnedAmount.toFixed(2)} will be returned.`, { id: toastId, duration: 5000 });
        dispatch(logout());
      } catch (err) {
        toast.error(err.response?.data?.message || "Deactivation failed.", { id: toastId });
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
       <h2 className="text-lg font-bold mb-4">Account Actions</h2>
       {error && <p className="text-red-500 mb-2">{error}</p>}
       <button 
        onClick={handleDeactivate}
        className="w-full py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-500"
       >
        Deactivate My Account
       </button>
       <p className="text-xs text-gray-500 mt-2">
        Note: You can only deactivate if you have no pending dues and no active loans.
       </p>
    </div>
  );
}

// The main Dashboard component now gets user info from Redux.
export default function Dashboard() {
  const { userInfo } = useSelector((state) => state.auth);
  const [userDashboard, setUserDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getDashboardData();
      setUserDashboard(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <>
      {loading && <p>Loading dashboard data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && userDashboard && (
        <>
          <h1 className="text-3xl font-bold mb-6">
            Welcome, {userInfo?.name || 'User'} 👋
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h2 className="text-gray-600">Your Contribution</h2>
              <p className="text-2xl font-bold text-indigo-600">
                ₹{userDashboard.totalContributions || 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h2 className="text-gray-600">Available Fund</h2>
              <p className="text-2xl font-bold text-green-600">
                ₹{userDashboard.poolTotalContributions - userDashboard.poolBlockedAmount || 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h2 className="text-gray-600">Your Account Balance</h2>
              <p className="text-2xl font-bold text-yellow-600">
                ₹{userDashboard.balance || 0}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
            <ul className="space-y-2 text-gray-700">
              {userDashboard.pendingLoans.length > 0 ? (
                userDashboard.pendingLoans.map(loan => (
                  <li key={loan._id}>📄 Loan request for ₹{loan.amount} is {loan.status}.</li>
                ))
              ) : (
                <li>No recent loan activity found.</li>
              )}
            </ul>
          </div>
          
          <WithdrawalForm 
            currentBalance={userDashboard.balance || 0}
            onWithdrawal={fetchDashboardData}
          />

          <AccountActions />
        </>
      )}
    </>
  );
}