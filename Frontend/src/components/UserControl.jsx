import React, { useEffect, useState } from "react";
import "./UserControl.css";
import AdminSidebar from "./AdminSidebar";

const UserControl = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    if (!token) {
      setError("No authentication token found.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/admin/get-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const text = await res.text();
      console.log("Raw response:", text);

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseErr) {
        throw new Error("Invalid JSON response: " + text.substring(0, 50));
      }

      console.log("Fetch users response:", result);

      if (!res.ok) {
        throw new Error(
          result.message || `HTTP ${res.status} Error: ${res.statusText}`
        );
      }

      if (result.success) {
        setUsers(result.data);
      } else {
        setError(result.message || "Failed to fetch users.");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      if (err.message.includes("403")) {
        setError("Access denied. Ensure you are logged in as an admin.");
      } else if (err.message.includes("Invalid JSON")) {
        setError("Server returned an error page. Check backend logs.");
      } else {
        setError(`An error occurred while fetching users: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found.");
      return;
    }

    if (
      !window.confirm(`Are you sure you want to delete user with ID ${userId}?`)
    ) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/admin/delete-user/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await res.json();
      console.log("Delete user response:", result);

      if (!res.ok) {
        throw new Error(result.message || `HTTP ${res.status} Error`);
      }

      if (result.success) {
        setUsers(users.filter((user) => user._id !== userId));
        setError(""); // Clear error on success
      } else {
        setError(result.message || "Failed to delete user.");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      if (err.message.includes("403")) {
        setError("Access denied. Admin role required to delete users.");
      } else {
        setError(`An error occurred while deleting user: ${err.message}`);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="main-contain">
      <AdminSidebar />
      <div className="user-control-container">
        <h2>User Management</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <ul className="user-list">
            {users.map((user) => (
              <li key={user._id} className="user-cards">
                <div className="user-details">
                  <p>
                    <strong>Name:</strong> {user.name || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email || "N/A"}
                  </p>
                  <p>
                    <strong>Admin:</strong> {user.isAdmin ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {user.updatedAt
                      ? new Date(user.updatedAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteUser(user._id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserControl;
