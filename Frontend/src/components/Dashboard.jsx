import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./Sidebar";
import { FileText, Sun, Moon, PlusCircle, BarChart } from "lucide-react";
import "./Dashboard.css";

function Dashboard() {
  const [fileCount, setFileCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No authentication token found. Please log in.");
          navigate("/login");
          return;
        }

        // Fetch total file count
        try {
          const countRes = await fetch(
            "http://localhost:8080/api/excel/count",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const countData = await countRes.json();
          if (countData.success) setFileCount(countData.count || 0);
        } catch (err) {
          toast.error("Error fetching file count: " + err.message);
          setFileCount(0);
        }

        // Fetch uploaded files
        try {
          const filesRes = await fetch(
            "http://localhost:8080/api/get-excel-data",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const filesData = await filesRes.json();
          if (filesData.success) {
            setFiles(filesData.data || []);
          } else {
            throw new Error(filesData.message);
          }
        } catch (err) {
          toast.error("Error fetching files: " + err.message);
          setFiles([]);
        }

        // Fetch analysis history
        try {
          const historyRes = await fetch(
            "http://localhost:8080/api/get-analysis-history",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const historyData = await historyRes.json();
          if (historyData.success) {
            setHistory(historyData.data || []);
            setHistoryCount(historyData.data.length || 0);
          } else {
            throw new Error(historyData.message);
          }
        } catch (err) {
          toast.error("Error fetching chart history: " + err.message);
          setHistory([]);
          setHistoryCount(0);
        }
      } catch (err) {
        toast.error("Unexpected error: " + err.message);
      }
    };

    fetchData();
  }, [navigate]);

  const filteredFiles = files.filter((file) =>
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateChart = (file) => {
    navigate("/files", {
      state: { fileId: file._id, fileName: file.filename },
    });
  };

  const handleAddFile = () => {
    navigate("/files");
  };

  const handleReopenChart = (item) => {
    if (!item.xAxis || !item.yAxis || !item.chartType || !item.fileId) {
      toast.error("Incomplete chart data");
      return;
    }
    navigate("/chart", {
      state: {
        xAxis: item.xAxis,
        yAxis: item.yAxis,
        chartType: item.chartType,
        fileId: item.fileId,
        fileName: item.fileName,
        reopen: true,
      },
    });
  };

  return (
    <div className={`dashboard-wrapper ${theme}`}>
      {role === "admin" ? <AdminSidebar /> : <Sidebar />}
      <div className="dashboard-main-content">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">User Dashboard</h1>
          <div className="header-actions"></div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stats-card">
            <h3>Total Uploaded Files</h3>
            <p className="stats-value">{fileCount}</p>
          </div>
          <div className="stats-card">
            <h3>Total Chart History</h3>
            <BarChart size={24} />
            <p className="stats-value">{historyCount}</p>
          </div>
        </div>

        {/* Search Section */}
        <div className="action-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Uploaded Files */}
        <div className="files-section">
          <h2 className="section-title">Uploaded Files</h2>
          <div className="files-grid">
            <div className="file-card add-file-card" onClick={handleAddFile}>
              <PlusCircle size={40} className="card-icon add-file-icon" />
              <h3 className="file-title">Add File</h3>
              <p className="file-meta">Click to upload a new file</p>
            </div>

            {filteredFiles.length > 0 ? (
              filteredFiles.map((file) => (
                <div key={file._id} className="file-card">
                  <FileText size={40} className="card-icon" />
                  <h3 className="file-title">{file.filename}</h3>
                  <p className="file-meta">
                    Uploaded on: {new Date(file.uploadedAt).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleGenerateChart(file)}
                    className="action-button generate-chart"
                  >
                    Generate Chart
                  </button>
                </div>
              ))
            ) : (
              <p className="no-data-text">No files available.</p>
            )}
          </div>
        </div>

        {/* Chart History */}
        <div className="history-section">
          <h2 className="section-title">Recent Analysis History</h2>
          {history.length === 0 ? (
            <p className="no-data-text">No chart analysis history available.</p>
          ) : (
            <ul className="history-list">
              {history.slice(0, 5).map((item) => (
                <li key={item._id} className="history-card">
                  <div>
                    <p>
                      <strong>File:</strong> {item.fileName}
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
                    <button
                      className="action-button"
                      onClick={() => handleReopenChart(item)}
                    >
                      Reopen
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Dashboard;
