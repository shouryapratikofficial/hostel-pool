import { useState, useEffect } from "react";
import api from "../services/api";

export default function Contributions() {
  const [contributions, setContributions] = useState([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchContributions = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/contributions/my");
      setContributions(data); // Assume data is the array, as per our backend
    } catch (err) {
      setError("Failed to load contributions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!amount) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/contributions/add", {
        amount: parseInt(amount),
      });
      setContributions([data.contribution, ...contributions]);
      setAmount("");
    } catch (err) {
      setError("Failed to add contribution.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Contributions</h1>

      {error && (
        <div className="mb-4 text-red-600 font-semibold">{error}</div>
      )}

      {/* Add Contribution Form */}
      <form
        onSubmit={handleAdd}
        className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4"
      >
        <input
          type="number"
          placeholder="Amount in ₹"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded-lg px-3 py-2 flex-1"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Processing..." : "Add"}
        </button>
      </form>

      {/* Contributions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-200 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {contributions.length === 0 && !loading ? (
              <tr>
                <td colSpan={2} className="text-center py-4 text-gray-500">
                  No contributions found.
                </td>
              </tr>
            ) : (
              contributions.map((c) => (
                <tr key={c._id} className="border-t">
                  <td className="px-4 py-2">{new Date(c.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 font-medium">{c.amount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}