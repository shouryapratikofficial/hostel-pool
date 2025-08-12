import { useState } from "react";
import { useAuth } from "../context/AuthContext";
export default function Dashboard() {
  const [user] = useState({
    name: "John Doe",
    role: "member", // ya 'admin'
  });

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-800">
          HostelPool
        </div>
        <nav className="flex flex-col gap-2 p-4">
          <a href="/dashboard" className="px-4 py-2 rounded-lg hover:bg-gray-800">
            Dashboard
          </a>
          <a href="/contributions" className="px-4 py-2 rounded-lg hover:bg-gray-800">
            Contributions
          </a>
          <a href="/loans" className="px-4 py-2 rounded-lg hover:bg-gray-800">
            Loans
          </a>
          {user.role === "admin" && (
            <a href="/admin" className="px-4 py-2 rounded-lg hover:bg-gray-800">
              Admin Panel
            </a>
          )}
        </nav>
        <div className="mt-auto p-4 border-t border-gray-800">
          <button className="w-full px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">
          Welcome, {user.name} 👋
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-gray-600">Your Contribution</h2>
            <p className="text-2xl font-bold text-indigo-600">₹ 1,000</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-gray-600">Available Fund</h2>
            <p className="text-2xl font-bold text-green-600">₹ 3,000</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-gray-600">Total Profit</h2>
            <p className="text-2xl font-bold text-yellow-600">₹ 150</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
          <ul className="space-y-2 text-gray-700">
            <li>💰 You contributed ₹500</li>
            <li>📄 Loan request for ₹2,000 pending approval</li>
            <li>✅ Loan of ₹1,000 repaid</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
