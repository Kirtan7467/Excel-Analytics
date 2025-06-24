import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import AdminSidebar from "./AdminSidebar"; // ✅ Import admin sidebar
import "./History.css";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole"); // "admin" or "user"

  // Dynamically decide which sidebar to show
  const SidebarComponent = role === "admin" ? AdminSidebar : Sidebar;

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          "http://localhost:8080/api/get-analysis-history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await res.json();
        if (result.success) {
          setHistory(result.data);
        } else {
          setError(result.message || "Failed to fetch analysis history.");
        }
      } catch (err) {
        console.error("Error fetching analysis history:", err);
        setError("An error occurred while fetching analysis history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleReopen = async (item) => {
    let { xAxis, yAxis, chartType, fileId, fileName } = item;

    if (!xAxis || !yAxis || !chartType || !fileId) {
      alert("Incomplete chart data. Cannot reopen.");
      return;
    }

    // Fetch fileName if missing
    if (!fileName) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:8080/api/get-file/${fileId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const result = await res.json();
        if (result.success && result.data) {
          fileName = result.data.filename;
        } else {
          alert("Failed to fetch file name. Cannot reopen chart.");
          return;
        }
      } catch (error) {
        console.error("Error fetching file name:", error.message);
        alert("Error fetching file name.");
        return;
      }
    }

    navigate("/chart", {
      state: {
        xAxis,
        yAxis,
        chartType,
        fileId,
        fileName,
        reopen: true,
      },
    });
  };

  const handleDelete = async (fileId, entryId) => {
    if (!fileId || !entryId) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:8080/api/delete-analysis-history/${fileId}/${entryId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await res.json();
      if (result.success) {
        setHistory((prev) => prev.filter((item) => item._id !== entryId));
      } else {
        alert("Failed to delete chart history.");
      }
    } catch (err) {
      console.error("Error deleting history:", err);
      alert("Error occurred while deleting.");
    }
  };

  return (
    <div className="history-container">
      <SidebarComponent /> {/* ✅ Conditionally rendered sidebar */}
      <div className="history-main">
        <h2>{role === "admin" ? "Admin" : "User"} Analysis History</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : history.length === 0 ? (
          <p>No analysis history available.</p>
        ) : (
          <ul className="history-list">
            {history.map((item) => (
              <li key={item._id} className="history-card">
                <div>
                  <p>
                    <strong>FileName:</strong> {item.fileName}
                  </p>
                  <p>
                    <strong>X:</strong> {item.xAxis} | <strong>Y:</strong>{" "}
                    {item.yAxis}
                  </p>
                  <p>
                    <strong>Type:</strong> {item.chartType}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="button-group">
                  <button
                    onClick={() => handleReopen(item)}
                    className="reopen-btn"
                  >
                    Reopen
                  </button>
                  <button
                    onClick={() => handleDelete(item.fileId, item._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default History;
