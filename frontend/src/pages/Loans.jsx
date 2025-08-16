import { useState, useEffect } from "react";
import api from "../services/api";

function RepayConfirmationModal({ loan, details, onConfirm, onCancel, loading }) {
  if (!loan) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Confirm Repayment</h2>
        <p className="mb-2">You are about to repay the loan for:</p>
        <div className="bg-gray-100 p-3 rounded-md mb-4">
          <p><strong>Purpose:</strong> {loan.purpose}</p>
          <p><strong>Principal Amount:</strong> ₹{details.principal}</p>
          <p><strong>Interest Due:</strong> ₹{details.interest}</p>
          <hr className="my-2"/>
          <p className="font-bold text-lg"><strong>Total to Repay: ₹{details.total}</strong></p>
        </div>
        <div className="flex justify-end gap-4">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm & Repay'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [repayModal, setRepayModal] = useState({ isOpen: false, loan: null, details: null });

  const fetchMyLoans = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/loans/myloans"); // FIX: "/api" removed
      setLoans(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load loan history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLoans();
  }, []);

  const handleRequestLoan = async (e) => {
    e.preventDefault();
    if (!amount || !purpose) {
      setError("Please enter an amount and purpose.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/loans/request", { // FIX: "/api" removed
        amount: parseInt(amount),
        purpose
      });
      setLoans([data.loan, ...loans]);
      setAmount("");
      setPurpose("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request loan.");
    } finally {
      setLoading(false);
    }
  };

  const showRepayConfirmation = async (loan) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/loans/${loan._id}/repayment-details`); // FIX: "/api" removed
      setRepayModal({ isOpen: true, loan: loan, details: data });
    } catch (err) {
      setError("Could not fetch repayment details.");
    } finally {
      setLoading(false);
    }
  };

  const handleRepayLoan = async () => {
    if (!repayModal.loan) return;
    setLoading(true);
    setError("");
    try {
      await api.patch(`/loans/${repayModal.loan._id}/repay`); // FIX: "/api" removed
      setRepayModal({ isOpen: false, loan: null, details: null });
      fetchMyLoans();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to repay loan.");
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
      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-200 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Amount (₹)</th>
              <th className="px-4 py-2 text-left">Purpose</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Total Repaid (₹)</th>
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
                 <td className="px-4 py-2 font-semibold">
                  {loan.status === "repaid" && typeof loan.repaidAmount === 'number' ? `₹${loan.repaidAmount.toFixed(2)}` : '-'}
                </td>
                <td className="px-4 py-2">
                  {loan.status === "approved" && (
                    <button
                      onClick={() => showRepayConfirmation(loan)}
                      className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-500"
                      disabled={loading}
                    >
                      Repay
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {loans.length === 0 && !loading && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No loans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {repayModal.isOpen && (
        <RepayConfirmationModal 
          loan={repayModal.loan}
          details={repayModal.details}
          onConfirm={handleRepayLoan}
          onCancel={() => setRepayModal({ isOpen: false, loan: null, details: null })}
          loading={loading}
        />
      )}
    </div>
  );
}