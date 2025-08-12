import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Navbar */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold tracking-wide">HostelPool</h1>
        <div className="space-x-4">
          <a href="/login" className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
            Login
          </a>
          <a href="/register" className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500">
            Register
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-grow text-center px-6">
        <h2 className="text-5xl font-extrabold mb-6">
          A Smarter Way to Pool Funds in Your Hostel
        </h2>
        <p className="text-gray-400 max-w-2xl mb-8">
          Contribute, borrow, and share profits transparently — powered by a
          community-driven pool fund system. Secure, fast, and built for your hostel needs.
        </p>
        <div className="space-x-4">
          <a
            href="/register"
            className="px-6 py-3 bg-indigo-600 rounded-lg text-lg hover:bg-indigo-500"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="px-6 py-3 bg-gray-800 rounded-lg text-lg hover:bg-gray-700"
          >
            Login
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-600 py-4 text-sm border-t border-gray-800">
        © {new Date().getFullYear()} HostelPool. Built for Hostel Life.
      </footer>
    </div>
  );
}
