import { useState, useEffect } from "react";
import api from "../../services/api";
import {getAdminSettings , updateAdminSettings} from "../../services/userService";
export default function AdminSettings() {
    const [settings, setSettings] = useState({
        weeklyContributionAmount: 0,
        lateFineAmount: 0,
        minimumWithdrawalAmount: 0,
        loanInterestRate: 5,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const { data } = await getAdminSettings();
                setSettings(data);
            } catch (err) {
                setError("Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            await updateAdminSettings(settings);
            setSuccess("Settings updated successfully!");
        } catch (err) {
            setError("Failed to update settings.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">System Settings</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}

            {!loading && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg max-w-lg">
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">
                            Weekly Contribution Amount (₹)
                        </label>
                        <input
                            type="number"
                            name="weeklyContributionAmount"
                            value={settings.weeklyContributionAmount}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-bold mb-2">
                            Late Fine Amount (₹)
                        </label>
                        <input
                            type="number"
                            name="lateFineAmount"
                            value={settings.lateFineAmount}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-bold mb-2">
                            Minimum Withdrawal Amount (₹)
                        </label>
                        <input
                            type="number"
                            name="minimumWithdrawalAmount"
                            value={settings.minimumWithdrawalAmount}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-bold mb-2">
                            Loan Interest Rate (% per month)
                        </label>
                        <input
                            type="number"
                            name="loanInterestRate"
                            value={settings.loanInterestRate}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2"
                            required
                            min="0"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Settings"}
                    </button>
                </form>
            )}
        </div>
    );
}