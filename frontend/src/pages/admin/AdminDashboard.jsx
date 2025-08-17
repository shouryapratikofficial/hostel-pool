import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {getAdminDashboardStats } from "../../services/userService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalAvailableBalance: 0,
    totalBalance: 0,
    blockedAmount: 0,
    profitPool: 0,
    totalUsers: 0,
    totalLoans: 0,
  });
  const [profitData, setProfitData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await getAdminDashboardStats();
        setStats(data);
        setProfitData(data.profitTrend);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch admin dashboard stats.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  return (
    <div className="bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
            <StatCard title="Total Available Balance" value={`₹${stats.totalAvailableBalance}`} />
            <StatCard title="Total Balance" value={`₹${stats.totalBalance}`} />
            <StatCard title="Blocked Amount" value={`₹${stats.blockedAmount}`} />
            <StatCard title="Profit Pool" value={`₹${stats.profitPool}`} />
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl shadow p-6 mb-4">
            <h2 className="text-xl font-semibold mb-4">Profit Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="profit" stroke="#4f46e5" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Navigation Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <NavButton label="Manage Loans" onClick={() => navigate("/admin/loans")} />
            <NavButton label="View Users" onClick={() => navigate("/admin/users")} />
            <NavButton label="Profit Pool" onClick={() => navigate("/admin/profit")} />
            <NavButton label="System Settings" onClick={() => navigate("/admin/settings")} />
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function NavButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 bg-indigo-600 text-white rounded-lg text-lg font-semibold hover:bg-indigo-500 transition"
    >
      {label}
    </button>
  );
}