import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats] = useState({
    totalAvailableBalance: 120000,
    totalBalance: 150000,
    blockedAmount: 30000,
    profitPool: 5000,
  });

  const data = [
    { month: "Jan", profit: 2000 },
    { month: "Feb", profit: 2500 },
    { month: "Mar", profit: 1800 },
    { month: "Apr", profit: 3000 },
    { month: "May", profit: 2800 },
    { month: "Jun", profit: 3500 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Available Balance" value={`₹${stats.totalAvailableBalance}`} />
        <StatCard title="Total Balance" value={`₹${stats.totalBalance}`} />
        <StatCard title="Blocked Amount" value={`₹${stats.blockedAmount}`} />
        <StatCard title="Profit Pool" value={`₹${stats.profitPool}`} />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Profit Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="profit" stroke="#4f46e5" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <NavButton label="Manage Loans" onClick={() => navigate("/admin/loans")} />
        <NavButton label="View Users" onClick={() => navigate("/admin/users")} />
        <NavButton label="Profit Pool" onClick={() => navigate("/admin/profit")} />
      </div>
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
