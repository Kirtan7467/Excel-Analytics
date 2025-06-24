import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./Sidebar";
import { FileText, Upload, X } from "lucide-react";
import "./Files.css";
import { jwtDecode } from "jwt-decode";
import AdminSidebar from "./AdminSidebar";

function Files() {
  const [file, setFile] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [storedData, setStoredData] = useState([]);
  const [showUploadedData, setShowUploadedData] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isFileActionPopupOpen, setIsFileActionPopupOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStoredData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          handleError("No authentication token found. Please log in.");
          return;
        }

        const response = await fetch(
          `http://localhost:8080/api/get-excel-data`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch stored data: ${response.status} - ${errorText}`
          );
        }

        const result = await response.json();
        if (result.success) {
          setStoredData(result.data);
        } else {
          handleError(result.message || "Failed to fetch stored data");
        }
      } catch (err) {
        handleError("Failed to fetch stored data: " + err.message);
      }
    };

    fetchStoredData();
  }, []);

  const role = localStorage.getItem("userRole");
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setShowUploadedData(false);
      setXAxis("");
      setYAxis("");
    }
  };

  const handleSuccess = (msg) => {
    toast.success(msg, { position: "top-right" });
  };

  const handleError = (msg) => {
    toast.error(msg, { position: "top-right" });
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      return handleError("Please select an Excel file to upload.");
    }

    const fileExists = storedData.some((entry) => entry.filename === file.name);
    if (fileExists) {
      handleError("File already exists. Please choose a different file.");
      return;
    }

    const token = localStorage.getItem("token");
    console.log("Token being sent:", token);
    if (!token) {
      handleError("You are not logged in. Please log in to upload files.");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("excelFile", file);
    console.log("File being uploaded:", file.name);

    try {
      const decoded = jwtDecode(token);
      const userId = decoded.id || decoded._id || decoded.userId;

      const response = await fetch(
        `http://localhost:8080/api/upload-excel/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      console.log("Upload response status:", response.status);
      if (!response.ok) {
        const text = await response.text();
        console.log("Upload error response text:", text);
        throw new Error(
          `Server responded with status ${response.status}: ${text}`
        );
      }

      const result = await response.json();
      console.log("Upload response result:", result);
      if (result.success) {
        handleSuccess("File uploaded successfully!");
        const fetchResponse = await fetch(
          "http://localhost:8080/api/get-excel-data",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Fetch stored data response status:", fetchResponse.status);
        const fetchResult = await fetchResponse.json();
        console.log("Fetch stored data result:", fetchResult);
        if (fetchResult.success) {
          setStoredData(fetchResult.data);
        } else {
          console.log("Failed to refresh stored data:", fetchResult.message);
        }
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setIsPopupOpen(false);
      } else {
        handleError(result.message || "Failed to upload file");
      }
    } catch (err) {
      console.error("Upload error:", err.message);
      handleError("Something went wrong: " + err.message);
    }
  };

  const handleFileActionClick = (entry) => {
    setSelectedFile(entry);
    setIsFileActionPopupOpen(true);
  };

  const fetchFileById = async (fileId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        handleError("No authentication token found. Please log in.");
        return null;
      }

      const response = await fetch(
        `http://localhost:8080/api/get-excel-data/${fileId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch file: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      if (result.success) {
        return result.data;
      } else {
        handleError(result.message || "Failed to fetch file");
        return null;
      }
    } catch (err) {
      handleError("Failed to fetch file: " + err.message);
      return null;
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !selectedFile._id) {
      handleError("Invalid file selected.");
      return;
    }

    const fileData = await fetchFileById(selectedFile._id);
    if (fileData && fileData.data) {
      setExcelData(fileData.data);
      setShowUploadedData(true);
      setXAxis("");
      setYAxis("");
    } else {
      handleError("Failed to load file data for analysis.");
    }
    setIsFileActionPopupOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedFile || !selectedFile._id) {
      handleError("Invalid file selected for deletion.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        handleError("You are not logged in. Please log in to delete files.");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/delete-excel/${selectedFile._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete file.");
      }

      setStoredData((prevData) =>
        prevData.filter((entry) => entry._id !== selectedFile._id)
      );
      setSelectedFile(null);
      setIsFileActionPopupOpen(false);
      handleSuccess("File deleted successfully.");
    } catch (err) {
      console.error("Delete error:", err);
      handleError("Failed to delete file: " + err.message);
    }
  };

  const generateFileName = (entry, index) => {
    return entry.filename
      ? `${entry.filename} (Uploaded on ${new Date(
          entry.uploadedAt
        ).toLocaleString()})`
      : `Excel Data #${storedData.length - index} (Uploaded on ${new Date(
          entry.uploadedAt
        ).toLocaleString()})`;
  };

  const sortData = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedData = [...excelData].sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];
      if (typeof valueA === "number" && typeof valueB === "number") {
        return direction === "asc" ? valueA - valueB : valueB - valueA;
      }
      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();
      if (strA < strB) return direction === "asc" ? -1 : 1;
      if (strA > strB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setExcelData(sortedData);
    setSortConfig({ key, direction });
  };

  const prepareChartData = () => {
    if (!excelData || !xAxis || !yAxis) return null;

    const labels = excelData.map((row) => row[xAxis]);
    const data = excelData.map((row) => row[yAxis]);

    return {
      labels,
      datasets: [
        {
          label: yAxis,
          data,
          backgroundColor: "rgba(13, 115, 119, 0.6)",
          borderColor: "rgba(13, 115, 119, 1)",
          borderWidth: 1,
          fill: false,
          tension: 0.4,
        },
      ],
    };
  };

  const prepareScatterData = () => {
    if (!excelData || !xAxis || !yAxis) return null;

    const data = excelData.map((row) => ({
      x: row[xAxis],
      y: row[yAxis],
    }));

    return {
      datasets: [
        {
          label: `${yAxis} vs ${xAxis}`,
          data,
          backgroundColor: "rgba(13, 115, 119, 0.6)",
          borderColor: "rgba(13, 115, 119, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const handleGenerateChart = async () => {
    if (!excelData || !xAxis || !yAxis) {
      handleError("Please select X-Axis and Y-Axis to generate the chart.");
      return;
    }

    const chartData = prepareChartData();
    const scatterData = prepareScatterData();

    const token = localStorage.getItem("token");

    try {
      await fetch("http://localhost:8080/api/log-analysis-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileId: selectedFile._id,
          action: "chart_created",
          details: {
            chartType: "line_and_scatter",
            xAxis,
            yAxis,
          },
        }),
      });
    } catch (err) {
      console.error("Error logging analysis action:", err.message);
    }

    navigate("/chart", { state: { chartData, scatterData, xAxis, yAxis } });
  };

  return (
    <div style={{ height: "100vh", display: "flex" }}>
      {role === "admin" ? <AdminSidebar /> : <Sidebar />}
      <div className="main-content">
        <div className="header-section">
          <h1 className="main-title">Excel Data Dashboard</h1>
          <button
            className="upload-trigger-button"
            onClick={() => setIsPopupOpen(true)}
          >
            <Upload size={20} className="me-2" />
            Upload Excel File
          </button>
        </div>

        {showUploadedData && excelData && excelData.length > 0 ? (
          <div className="excel-data-section">
            <button
              className="back-button1"
              onClick={() => {
                setShowUploadedData(false);
                setExcelData(null);
                setXAxis("");
                setYAxis("");
                setSelectedFile(null);
              }}
            >
              ← Back
            </button>
            <div className="chart-section">
              <h3 className="section-subtitle">Visualize Data</h3>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {xAxis && yAxis && (
                  <button
                    onClick={handleGenerateChart}
                    className="generate-chart-button"
                    style={{ flexShrink: 0, width: "150px" }}
                  >
                    Generate Chart
                  </button>
                )}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="xAxis"
                      className="block text-sm font-medium text-gray-700 uppercase tracking-wide mb-2"
                      style={{ marginRight: 5 }}
                    >
                      X-Axis
                    </label>
                    <select
                      id="xAxis"
                      value={xAxis}
                      onChange={(e) => setXAxis(e.target.value)}
                      className="block w-full px-3 py-2 mb-2 ml-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    >
                      <option value="">Select X-Axis</option>
                      {excelData[0] &&
                        Object.keys(excelData[0]).map((key) => (
                          <option key={key} value={key}>
                            {key}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="yAxis"
                      className="block text-sm font-medium text-gray-700 uppercase tracking-wide mb-4"
                      style={{ marginRight: 5 }}
                    >
                      Y-Axis
                    </label>
                    <select
                      id="yAxis"
                      value={yAxis}
                      onChange={(e) => setYAxis(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    >
                      <option value="">Select Y-Axis</option>
                      {excelData[0] &&
                        Object.keys(excelData[0]).map((key) => (
                          <option key={key} value={key}>
                            {key}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    {Object.keys(excelData[0]).map((key) => (
                      <th
                        key={key}
                        onClick={() => sortData(key)}
                        className="px-4 py-3 bg-gray-100 text-gray-700 text-xs font-semibold uppercase tracking-wider text-left border-b border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
                      >
                        {key}
                        {sortConfig.key === key && (
                          <span className="ml-1 text-teal-600">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {Object.values(row).map((value, i) => (
                        <td
                          key={i}
                          className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200"
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="stored-data-section">
            <h2 className="section-title">Stored Excel Data</h2>
            {storedData.length > 0 ? (
              <div className="stored-data-grid">
                {storedData.map((entry, index) => (
                  <div
                    key={entry._id}
                    className="stored-data-card"
                    onClick={() => handleFileActionClick(entry)}
                  >
                    <FileText size={40} className="card-icon" />
                    <p className="card-title">
                      {generateFileName(entry, index)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data-text">No stored data available.</p>
            )}
          </div>
        )}
      </div>

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h2 className="popup-title">Upload Excel File</h2>
              <button
                className="popup-close-button"
                onClick={() => setIsPopupOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label
                  htmlFor="excelFile"
                  className="block text-sm font-medium text-gray-700 uppercase tracking-wide mb-2"
                >
                  Select Excel File (.xls, .xlsx)
                </label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="excelFile"
                    accept=".xls,.xlsx"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="file-input"
                  />
                  <label htmlFor="excelFile" className="file-input-label">
                    <Upload size={20} className="me-2" />
                    Choose File
                  </label>
                  {file && (
                    <span className="file-selected-text">{file.name}</span>
                  )}
                </div>
              </div>
              <button type="submit" className="upload-button">
                Upload
              </button>
            </form>
            {excelData && excelData.length > 0 && (
              <button
                className="toggle-data-button"
                onClick={() => {
                  setShowUploadedData(!showUploadedData);
                  setIsPopupOpen(false);
                }}
              >
                {showUploadedData ? "Hide Uploaded Data" : "Show Uploaded Data"}
              </button>
            )}
          </div>
        </div>
      )}

      {isFileActionPopupOpen && selectedFile && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h2 className="popup-title">File Actions</h2>
              <button
                className="popup-close-button"
                onClick={() => setIsFileActionPopupOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleAnalyze}
                className="action-button bg-teal-600 hover:bg-teal-700"
              >
                Analyze
              </button>
              <button
                onClick={handleDelete}
                className="action-button bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default Files;
