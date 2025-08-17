import { useState, useEffect } from "react";
import { getAllUsers } from "../../services/userService";
import Pagination from "../../components/Pagination";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await getAllUsers();
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setError("Failed to fetch users: Unexpected data format.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
  
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-6">User List</h1>

      {loading && <p>Loading users...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && users.length === 0 && (
        <p className="text-center py-4 text-gray-500">No users found.</p>
      )}

      {Array.isArray(users) && users.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gray-200 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Contributions (₹)</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Balance (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
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