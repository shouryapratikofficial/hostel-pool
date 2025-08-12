import { useState, useEffect } from "react";
import api from "../../services/api";

export default function ProfitPool() {
  const [profit, setProfit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [distributionLoading, setDistributionLoading] = useState(false);
  const [distributionMessage, setDistributionMessage] = useState("");

  const fetchProfit = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/profit/status");
      setProfit(data.totalProfit);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch profit data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfit();
  }, []);

  const handleDistributeProfit = async () => {
    setDistributionLoading(true);
    setDistributionMessage("");
    try {
      const res = await api.post("/profit/distribute");
      setDistributionMessage(res.data.message);
      setProfit(0);
    } catch (err) {
      setDistributionMessage(err.response?.data?.message || "Failed to distribute profit.");
      console.error(err);
    } finally {
      setDistributionLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Profit Pool</h1>

      {loading && <p>Loading profit data...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Current Profit Pool</h2>
          <p className="text-4xl font-bold text-green-600 mb-6">
            ₹{profit.toFixed(2)}
          </p>

          <button
            onClick={handleDistributeProfit}
            disabled={distributionLoading || profit <= 0}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg text-lg font-semibold hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            {distributionLoading ? "Distributing..." : "Distribute Profit Now"}
          </button>
          
          {distributionMessage && (
            <p className="mt-4 text-center text-sm text-gray-700">{distributionMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}