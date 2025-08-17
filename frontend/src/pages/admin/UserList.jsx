import { useState, useEffect } from "react";
import api from "../../services/api";
import { getAllUsers } from "../../services/userService";
export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await getAllUsers();
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("API did not return an array:", data);
          setError("Failed to fetch users: Unexpected data format.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch users.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User List</h1>

      {loading && <p>Loading users...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && users.length === 0 && (
        <p className="text-center py-4 text-gray-500">No users found.</p>
      )}

      {Array.isArray(users) && users.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-200 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Contributions (₹)</th>
                <th className="px-4 py-2 text-left">Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2 capitalize">{user.role}</td>
                  <td className="px-4 py-2">{user.contributions || 0}</td>
                  <td className="px-4 py-2">{user.balance || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}