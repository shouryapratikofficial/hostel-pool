import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar - This will be the consistent sidebar for all pages */}
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
          {user?.role === "admin" && (
            <a href="/admin" className="px-4 py-2 rounded-lg hover:bg-gray-800">
              Admin Panel
            </a>
          )}
        </nav>
        <div className="mt-auto p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;