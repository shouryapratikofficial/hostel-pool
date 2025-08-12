import { useState, useEffect } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [userDashboard, setUserDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/users/dashboard");
        setUserDashboard(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch dashboard data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      {loading && <p>Loading dashboard data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && userDashboard && (
        <>
          <h1 className="text-3xl font-bold mb-6">
            Welcome, {userDashboard.name} 👋
          </h1>

          {/* Stats Cards - Now Dynamic */}
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

          {/* Recent Activity - Placeholder for now */}
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
        </>
      )}
    </>
  );
}