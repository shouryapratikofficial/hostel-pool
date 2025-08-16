import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

const Navbar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="bg-white shadow px-4 py-3 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">
        HostelPool
      </Link>
      <div className="space-x-4">
        {!userInfo && (
          <>
            <Link to="/login" className="text-gray-700 hover:underline">
              Login
            </Link>
            <Link to="/register" className="text-gray-700 hover:underline">
              Register
            </Link>
          </>
        )}
        {userInfo && (
          <>
            <Link to="/dashboard" className="text-gray-700 hover:underline">
              Dashboard
            </Link>
            {userInfo.role === "admin" && (
              <Link to="/admin" className="text-gray-700 hover:underline">
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:underline"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;