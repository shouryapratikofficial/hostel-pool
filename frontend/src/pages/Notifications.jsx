import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

// We will create a new slice for notifications later to handle the unread count globally.
// For now, this component will manage its own state.

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/notifications");
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
      // Refresh the list to show all as read
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

 const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await api.patch(`/notifications/${notification._id}/read`);
        setNotifications(notifications.map(n =>
          n._id === notification._id ? { ...n, read: true } : n
        ));
      }

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
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
                onClick={() => handleNotificationClick(n)}
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