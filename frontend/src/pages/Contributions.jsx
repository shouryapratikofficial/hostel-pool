import { useState, useEffect } from "react";
import api from "../services/api";
import { getContributionStatus, getContributionHistory, addContribution } from '../services/contributionService';

export default function Contributions() {
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState({
    isContributionDue: false,
    amountDue: 0,
    message: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchPageData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statusRes, historyRes] = await Promise.all([
        getContributionStatus(),
        getContributionHistory()
      ]);
      setStatus(statusRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      setError("Failed to load contribution data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const handlePay = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setError("");
    try {
           await addContribution(status.amountDue);

      fetchPageData(); 
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed.");
    } finally {
      setPaymentLoading(false);
    }
  };
  
  const getStatusColor = (status) => {
    if (status === 'Paid' || status === 'paid') return 'text-green-600';
    if (status === 'pending') return 'text-red-600';
    return 'text-gray-700';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Make Your Contribution</h1>

       {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}

      {loading ? <p>Loading payment status...</p> : (
        <form
          onSubmit={handlePay}
          className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4 items-center"
        >
          <div className="flex-1">
            <input
              type="text"
              value={`Amount to Pay: ₹${status.amountDue}`}
              className="border rounded-lg px-3 py-2 w-full bg-gray-100 text-gray-700 font-semibold"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1 ml-1">{status.message}</p>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={paymentLoading || !status.isContributionDue}
          >
            {paymentLoading ? "Processing..." : "Pay Now"}
          </button>
        </form>
      )}

      <h2 className="text-xl font-bold mb-4 mt-8">Your Transaction History</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
         <table className="w-full">
          <thead className="bg-gray-200 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Amount (₹)</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && !loading ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No transaction history found.
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="px-4 py-2">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 font-medium">{item.type}</td>
                  <td className="px-4 py-2">{item.amount}</td>
                  <td className={`px-4 py-2 font-bold capitalize ${getStatusColor(item.status)}`}>
                    {item.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}