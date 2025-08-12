import { useState, useEffect } from "react";
import api from "../services/api";

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState(""); // Naya state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Loan history fetch karein
  const fetchMyLoans = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/loans/myloans"); // Corrected endpoint
      setLoans(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load loan history.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLoans();
  }, []);

  // Loan request handle karein
  const handleRequestLoan = async (e) => {
    e.preventDefault();
    if (!amount || !purpose) {
      setError("Please enter an amount and purpose.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/loans/request", {
        amount: parseInt(amount),
        purpose
      });
      setLoans([data.loan, ...loans]); // Naya loan list mein add karein
      setAmount("");
      setPurpose("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request loan.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Loan repayment handle karein
  const handleRepayLoan = async (id) => {
    setLoading(true);
    setError("");
    try {
      await api.patch(`/loans/${id}/repay`);
      fetchMyLoans(); // List ko refresh karein
    } catch (err) {
      setError(err.response?.data?.message || "Failed to repay loan.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "text-green-600";
      case "pending": return "text-yellow-600";
      case "repaid": return "text-blue-600";
      case "rejected": return "text-red-600";
      default: return "";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Loan Management</h1>

      {error && (
        <div className="mb-4 text-red-600 font-semibold">{error}</div>
      )}

      {/* Loan Request Form */}
      <form
        onSubmit={handleRequestLoan}
        className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4"
      >
        <input
          type="number"
          placeholder="Enter Loan Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded-lg px-3 py-2"
          disabled={loading}
          required
        />
        <input
          type="text"
          placeholder="Purpose of Loan"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="border rounded-lg px-3 py-2 flex-1"
          disabled={loading}
          required
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Requesting..." : "Request Loan"}
        </button>
      </form>

      {/* Loan History Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-200 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Amount (₹)</th>
              <th className="px-4 py-2 text-left">Purpose</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan._id} className="border-t">
                <td className="px-4 py-2">
                  {new Date(loan.requestedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">{loan.amount}</td>
                <td className="px-4 py-2">{loan.purpose}</td>
                <td className={`px-4 py-2 font-medium ${getStatusColor(loan.status)}`}>
                  {loan.status}
                </td>
                <td className="px-4 py-2">
                  {loan.status === "approved" && (
                    <button
                      onClick={() => handleRepayLoan(loan._id)}
                      className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-500"
                    >
                      Repay
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {loans.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No loans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}