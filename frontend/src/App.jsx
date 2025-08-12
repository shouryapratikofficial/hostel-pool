import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import AdminDashboard from "./pages/admin/AdminDashboard";

import Loans from "./pages/Loans";
import LoanManagement from "./pages/admin/LoanManagement";
import UserList from "./pages/admin/UserList";
import ProfitPool from "./pages/admin/ProfitPool";
import Contributions from "./pages/Contributions";

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const noNavbarRoutes = ["/"];
  const hideNavbar = noNavbarRoutes.includes(location.pathname);


  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contributions" element={<Contributions />} />
          <Route path="/loans" element={<Loans />} />
        </Route>

        {/* Admin only */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/loans" element={<LoanManagement />} />
          <Route path="/admin/users" element={<UserList />} />
          <Route path="/admin/profit" element={<ProfitPool />} />

        </Route>
      </Routes>
    </>
  );
}

export default App;
