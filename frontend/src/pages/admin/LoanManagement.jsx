import { useState, useEffect } from "react";
import api from "../../services/api";
import { getAllLoans, approveLoan, rejectLoan } from '../../services/loanService';

export default function LoanManagement() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLoans = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getAllLoans();
      setLoans(data);
    } catch (err) {
      setError("Failed to fetch loans.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveLoan(id);
      fetchLoans();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve loan.");
      console.error(err);
    }
  };

  const handleReject = async (id) => { // Updated function
    try {
       await rejectLoan(id);
      fetchLoans();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject loan.");
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "repaid":
        return "text-blue-600";
      case "rejected":
        return "text-red-600";
      default:
        return "";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Loan Management</h1>
      
      {loading && <p>Loading loans...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-200 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">Borrower</th>
              <th className="px-4 py-2 text-left">Amount (₹)</th>
              <th className="px-4 py-2 text-left">Purpose</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan._id} className="border-t">
                <td className="px-4 py-2">{loan.borrower?.name}</td>
                <td className="px-4 py-2">{loan.amount}</td>
                <td className="px-4 py-2">{loan.purpose}</td>
                <td className={`px-4 py-2 font-medium ${getStatusColor(loan.status)}`}>
                  {loan.status}
                </td>
                <td className="px-4 py-2">
                  {loan.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(loan._id)}
                        className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-500"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(loan._id)}
                        className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-500"
                      >
                        Reject
                      </button>
                    </div>
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