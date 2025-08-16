import { useState, useEffect } from "react";
import api from "../services/api";

export default function TransactionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/profit/history"); // FIX: "/api" removed
        setHistory(data);
      } catch (err) {
        setError("Failed to fetch transaction history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Transaction History</h1>

      {loading && <p>Loading history...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && history.length === 0 && (
        <p className="text-center py-4 text-gray-500">No transactions found.</p>
      )}

      {!loading && history.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry._id} className="border-t">
                  <td className="px-4 py-2">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 font-medium">{entry.type}</td>
                  <td className={`px-4 py-2 font-bold ${
                      entry.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {entry.transactionType === 'credit' ? '+' : '-'} ₹{entry.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}