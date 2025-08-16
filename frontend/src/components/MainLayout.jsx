import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { Link } from 'react-router-dom';
const MainLayout = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };
  
  const handleNotificationClick = () => {
    navigate('/notifications');
  };
  
  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-800 flex justify-between items-center">
          <span>HostelPool</span>
          {userInfo && (
            <div className="relative" onClick={handleNotificationClick}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Notification count logic will be re-implemented later */}
            </div>
          )}
        </div>
        <nav className="flex flex-col gap-2 p-4">
          <Link to="/dashboard" className="px-4 py-2 rounded-lg hover:bg-gray-800">
            Dashboard
          </Link>
          <Link to="/contributions" className="px-4 py-2 rounded-lg hover:bg-gray-800">
            Contributions
          </Link>
          <Link to="/loans" className="px-4 py-2 rounded-lg hover:bg-gray-800">
            Loans
          </Link>
          <Link to="/profit" className="px-4 py-2 rounded-lg hover:bg-gray-800">
            Profit History
          </Link>
          {userInfo?.role === "admin" && (
            <Link to="/admin" className="px-4 py-2 rounded-lg hover:bg-gray-800">
              Admin Panel
            </Link>
          )}
        </nav>
        <div className="mt-auto p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500">
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;