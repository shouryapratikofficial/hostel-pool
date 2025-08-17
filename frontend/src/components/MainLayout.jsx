import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';

const MainLayout = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleNotificationClick = () => {
    setSidebarOpen(false); // Close sidebar on click
    navigate('/notifications');
  };

  const handleLinkClick = () => {
    setSidebarOpen(false); // Close sidebar when a nav link is clicked
  };

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-gray-900 text-white flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } md:w-64 md:relative md:translate-x-0`}
      >
        <div className="overflow-hidden flex-1 flex flex-col">
          <div className="p-6 text-2xl font-bold border-b border-gray-800 flex justify-between items-center">
            <span>HostelPool</span>
            {userInfo && (
              <div className="relative" onClick={handleNotificationClick}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 cursor-pointer"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
            )}
          </div>
          <nav className="flex flex-col gap-2 p-4">
            <Link to="/dashboard" onClick={handleLinkClick} className="px-4 py-2 rounded-lg hover:bg-gray-800">Dashboard</Link>
            <Link to="/contributions" onClick={handleLinkClick} className="px-4 py-2 rounded-lg hover:bg-gray-800">Contributions</Link>
            <Link to="/loans" onClick={handleLinkClick} className="px-4 py-2 rounded-lg hover:bg-gray-800">Loans</Link>
            <Link to="/profit" onClick={handleLinkClick} className="px-4 py-2 rounded-lg hover:bg-gray-800">Profits</Link>
            {userInfo?.role === 'admin' && (
              <Link to="/admin" onClick={handleLinkClick} className="px-4 py-2 rounded-lg hover:bg-gray-800">Admin</Link>
            )}
          </nav>
          <div className="mt-auto p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Top bar for mobile */}
        <header className="md:hidden bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
          <span className="text-xl font-bold text-indigo-600">HostelPool</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
       {/* Overlay for mobile */}
       {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default MainLayout;