import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { getContributionStatus, getContributionHistory, addContribution } from '../services/contributionService';
import Pagination from "../components/Pagination";

export default function Contributions() {
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState({
    isContributionDue: false,
    amountDue: 0,
    message: ""
  });
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Data fetch karne ke liye function
  const fetchPageData = async () => {
    setLoading(true);
    try {
      // Dono API calls ek saath karo for speed
      const [statusRes, historyRes] = await Promise.all([
        getContributionStatus(),
        getContributionHistory()
      ]);
      setStatus(statusRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to load contribution data.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Component load hone par data fetch karo
  useEffect(() => {
    fetchPageData();
  }, []);

  // Payment handle karne ke liye function
  const handlePay = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    const toastId = toast.loading('Processing payment...');

    try {
      // Backend ko wohi amount bhejo jo usne humein bataya tha
      const result = await addContribution(status.amountDue);
      toast.success(result.data.message, { id: toastId });
      // Payment ke baad page ka data refresh karo
      fetchPageData(); 
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Payment failed.";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setPaymentLoading(false);
    }
  };
  
  // Status ke hisaab se text ka color set karne ke liye
  const getStatusColor = (status) => {
    if (status === 'Paid' || status === 'paid') return 'text-green-600';
    if (status === 'pending') return 'text-red-600';
    return 'text-gray-700';
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(history.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4">Make Your Contribution</h1>

      {loading ? <p>Loading payment status...</p> : (
        <form
          onSubmit={handlePay}
          className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col sm:flex-row gap-4 items-center"
        >
          <div className="flex-1 w-full">
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
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            disabled={paymentLoading || !status.isContributionDue}
          >
            {paymentLoading ? "Processing..." : `Pay ₹${status.amountDue}`}
          </button>
        </form>
      )}

      <h2 className="text-xl font-bold mb-4 mt-8">Your Transaction History</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
         <table className="w-full min-w-max">
          <thead className="bg-gray-200 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Description</th>
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
              currentItems.map((item) => (
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
       {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}