import { useState, useEffect } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch all notifications for the user, not just unread ones
      const { data } = await api.get("/notifications?all=true"); // We'll assume a new query parameter to fetch all notifications
      setNotifications(data);
    } catch (err) {
      setError("Failed to fetch notifications.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  const handleNotificationClick = (link) => {
    if (link) {
      window.location.href = link;
      // After navigation, mark the clicked notification as read
      // This part would require a separate API call to mark a single notification, which is not implemented in the current backend suggestion.
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      {loading && <p>Loading notifications...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && notifications.length === 0 && (
        <p className="text-center py-4 text-gray-500">No notifications found.</p>
      )}

      {!loading && notifications.length > 0 && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={markAllAsRead}
              className="text-blue-600 hover:underline disabled:opacity-50"
              disabled={notifications.every(n => n.read)}
            >
              Mark all as read
            </button>
          </div>
          <div className="bg-white rounded-lg shadow divide-y">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center ${n.read ? 'text-gray-500' : 'font-semibold'}`}
                onClick={() => handleNotificationClick(n.link)}
              >
                <div>
                  <p>{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}