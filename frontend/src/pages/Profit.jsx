import { useState, useEffect } from "react";
import api from "../services/api";
import { getTransactionHistory } from "../services/profitService";
import Pagination from "../components/Pagination";

export default function TransactionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data } = await getTransactionHistory();
        setHistory(data);
      } catch (err) {
        setError("Failed to fetch transaction history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(history.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Transaction History</h1>

      {loading && <p>Loading history...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && history.length === 0 && (
        <p className="text-center py-4 text-gray-500">No transactions found.</p>
      )}

      {!loading && history.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-200 text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((entry) => (
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
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}