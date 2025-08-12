import { useState, useEffect } from "react";

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [amount, setAmount] = useState("");

  // ✅ Fetch loan history from API
  useEffect(() => {
    fetch("/api/loans/my") // replace with real API
      .then(res => res.json())
      .then(data => setLoans(data))
      .catch(err => console.error(err));
  }, []);

  // ✅ Handle Loan Request
  const handleRequestLoan = async (e) => {
    e.preventDefault();
    if (!amount) return;

    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseInt(amount) }),
      });

      const data = await res.json();

      if (res.ok) {
        setLoans([data.loan, ...loans]); // prepend new loan
        setAmount("");
      } else {
        alert(data.message || "Failed to request loan");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
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
          className="border rounded-lg px-3 py-2 flex-1"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500"
        >
          Request Loan
        </button>
      </form>

      {/* Loan History Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-200 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Amount (₹)</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan._id} className="border-t">
                <td className="px-4 py-2">
                  {new Date(loan.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">{loan.amount}</td>
                <td className={`px-4 py-2 font-medium ${getStatusColor(loan.status)}`}>
                  {loan.status}
                </td>
              </tr>
            ))}
            {loans.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
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
