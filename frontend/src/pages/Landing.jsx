import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // Import useSelector

import {
  ShieldCheckIcon,
  CurrencyRupeeIcon,
  ChartPieIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';

export default function Landing() {
  const { userInfo } = useSelector((state) => state.auth); // Get user info from Redux
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo) {
      navigate("/dashboard");
    }
  }, [userInfo, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-inter">
      {/* Navbar Section */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-wide text-indigo-400">HostelPool</h1>
        <div className="space-x-4">
          <a href="/login" className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition">
            Login
          </a>
          <a href="/register" className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition">
            Register
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-grow text-center px-6 py-20 bg-gradient-to-b from-slate-950 to-slate-900">
        <h2 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fade-in">
          HostelPool: Your Smart Savings Partner for Hostel Life
        </h2>
        <p className="text-slate-400 max-w-3xl mb-10 text-lg md:text-xl animate-fade-in-delay-1">
          A community-driven fund management system that allows you to contribute, borrow, and share profits. Everything is transparent and secure.
        </p>
        <div className="space-x-4 animate-fade-in-delay-2">
          <a
            href="/register"
            className="px-8 py-4 bg-indigo-600 rounded-xl text-xl font-semibold hover:bg-indigo-500 transition shadow-lg"
          >
            Join Now!
          </a>
          <a
            href="/login"
            className="px-8 py-4 bg-slate-800 rounded-xl text-xl font-semibold hover:bg-slate-700 transition shadow-lg"
          >
            Login
          </a>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-slate-900 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-16 text-indigo-400">Our Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* Feature Card 1 */}
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl flex flex-col items-center text-center transform transition-transform hover:scale-105">
              <CurrencyRupeeIcon className="h-16 w-16 text-green-400 mb-4" />
              <h4 className="text-2xl font-bold mb-2">Weekly Contributions</h4>
              <p className="text-slate-400">
                Contribute a fixed amount every week. The amount is set by the admin to strengthen the pool.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl flex flex-col items-center text-center transform transition-transform hover:scale-105">
              <ShieldCheckIcon className="h-16 w-16 text-blue-400 mb-4" />
              <h4 className="text-2xl font-bold mb-2">Transparent Loan System</h4>
              <p className="text-slate-400">
                Get a loan from the pool in a secure and transparent manner. All loans require admin approval.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl flex flex-col items-center text-center transform transition-transform hover:scale-105">
              <ChartPieIcon className="h-16 w-16 text-purple-400 mb-4" />
              <h4 className="text-2xl font-bold mb-2">Profit Sharing</h4>
              <p className="text-slate-400">
                Monthly profits are distributed equally among all eligible members.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl flex flex-col items-center text-center transform transition-transform hover:scale-105">
              <ArrowPathIcon className="h-16 w-16 text-yellow-400 mb-4" />
              <h4 className="text-2xl font-bold mb-2">Accountability System</h4>
              <p className="text-slate-400">
                Late contributions are subject to a fine, ensuring accountability for all members.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Terms & Policy Section */}
      <section className="bg-slate-950 py-20 px-6">
        <div className="max-w-4xl mx-auto text-slate-400">
          <h3 className="text-4xl font-bold text-center mb-12 text-indigo-400">Terms & Policy</h3>
          <div className="space-y-8 text-lg">
            
            <div>
              <h4 className="text-2xl font-bold text-white mb-2">Contributions Rules</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Weekly contributions are mandatory.</li>
                <li>Late contributions will incur a fine.</li>
                <li>You must clear all pending dues (pending contributions + fines) at once.</li>
              </ul>
            </div>

            <div>
              <h4 className="text-2xl font-bold text-white mb-2">Profit Distribution Rules</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>To be eligible for monthly profit sharing, you must make all weekly contributions for that month on time.</li>
                <li>If you have any pending dues, your profit share will be reserved until you clear all your dues.</li>
              </ul>
            </div>

            <div>
              <h4 className="text-2xl font-bold text-white mb-2">Withdrawal & Exit Rules</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>You can withdraw your account balance at any time, provided you have no pending dues or active loans.</li>
                <li>The same conditions apply for exiting the system.</li>
                <li>The withdrawal amount must not be less than the minimum amount set by the admin.</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-slate-600 py-4 text-sm border-t border-slate-800">
        © {new Date().getFullYear()} HostelPool. Built for Hostel Life.
      </footer>
    </div>
  );
}
