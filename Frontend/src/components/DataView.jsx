import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie, Scatter } from "react-chartjs-2";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function DataView() {
  const { id } = useParams();
  const [dataEntry, setDataEntry] = useState(null);
  const [error, setError] = useState(null);
  const [sortedData, setSortedData] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [chartType, setChartType] = useState("bar");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/get-excel-data/${id}`
        );
        const result = await response.json();
        if (result.success) {
          setDataEntry(result.data);
          setSortedData(result.data.data);
        } else {
          setError(result.message || "Failed to load data");
        }
      } catch (err) {
        setError("Failed to load data: " + err.message);
      }
    };

    fetchData();
  }, [id]);

  const sortData = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...sortedData].sort((a, b) => {
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

    setSortedData(sorted);
    setSortConfig({ key, direction });
  };

  const prepareChartData = () => {
    if (!sortedData || !xAxis || !yAxis) return null;

    const labels = sortedData.map((row) => row[xAxis]);
    const data = sortedData.map((row) => row[yAxis]);

    return {
      labels,
      datasets: [
        {
          label: yAxis,
          data,
          backgroundColor: "rgba(29, 78, 216, 0.6)",
          borderColor: "rgba(29, 78, 216, 1)",
          borderWidth: 1,
          fill: chartType === "line",
          tension: chartType === "line" ? 0.4 : 0,
        },
      ],
    };
  };

  const prepareScatterData = () => {
    if (!sortedData || !xAxis || !yAxis) return null;

    const data = sortedData.map((row) => ({
      x: row[xAxis],
      y: row[yAxis],
    }));

    return {
      datasets: [
        {
          label: `${yAxis} vs ${xAxis}`,
          data,
          backgroundColor: "rgba(29, 78, 216, 0.6)",
          borderColor: "rgba(29, 78, 216, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const ThreeDBarChart = () => {
    if (!sortedData || !xAxis || !yAxis) return null;

    const labels = sortedData.map((row) => row[xAxis]);
    const data = sortedData.map((row) => row[yAxis]);

    const maxValue = Math.max(...data.map((val) => Math.abs(val)));
    const scaleFactor = maxValue > 0 ? 5 / maxValue : 1;

    return (
      <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        {data.map((value, index) => {
          const height = value * scaleFactor;
          return (
            <mesh
              key={index}
              position={[index * 1.5 - (data.length * 1.5) / 2, height / 2, 0]}
            >
              <boxGeometry args={[1, height, 1]} />
              <meshStandardMaterial color="#1D4ED8" />
              <Text
                position={[0, height + 0.5, 0]}
                fontSize={0.5}
                color="black"
                anchorX="center"
                anchorY="middle"
              >
                {labels[index]}
              </Text>
            </mesh>
          );
        })}
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    );
  };

  const ThreeDScatterChart = () => {
    if (!sortedData || !xAxis || !yAxis) return null;

    const data = sortedData.map((row) => ({
      x: row[xAxis],
      y: row[yAxis],
      z: 0,
    }));

    const maxX = Math.max(...data.map((d) => Math.abs(d.x)));
    const maxY = Math.max(...data.map((d) => Math.abs(d.y)));
    const maxValue = Math.max(maxX, maxY);
    const scaleFactor = maxValue > 0 ? 5 / maxValue : 1;

    return (
      <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        {data.map((point, index) => (
          <mesh
            key={index}
            position={[point.x * scaleFactor, point.y * scaleFactor, point.z]}
          >
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color="#1D4ED8" />
            <Text
              position={[0, 0.5, 0]}
              fontSize={0.3}
              color="black"
              anchorX="center"
              anchorY="middle"
            >
              {`(${point.x}, ${point.y})`}
            </Text>
          </mesh>
        ))}
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    );
  };

  const renderChart = () => {
    const chartData =
      chartType === "scatter" ? prepareScatterData() : prepareChartData();
    if (!chartData) return null;

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: `${yAxis} vs ${xAxis}` },
      },
    };

    switch (chartType) {
      case "bar":
        return <Bar data={chartData} options={options} />;
      case "line":
        return <Line data={chartData} options={options} />;
      case "pie":
        return <Pie data={chartData} options={options} />;
      case "scatter":
        return <Scatter data={chartData} options={options} />;
      case "3d-bar":
        return <ThreeDBarChart />;
      case "3d-scatter":
        return <ThreeDScatterChart />;
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-primary text-center mb-6">
              Error
            </h1>
            <p className="text-center text-error text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dataEntry || !sortedData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-primary text-center mb-6">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-4xl mx-auto transition-all duration-300 hover:shadow-3xl">
          <h1 className="text-2xl font-bold text-primary text-center mb-6">
            {dataEntry.filename
              ? `Viewing ${dataEntry.filename}`
              : "Viewing Excel Data"}{" "}
            - Uploaded on {new Date(dataEntry.uploadedAt).toLocaleString()}
          </h1>
          {sortedData && sortedData.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      {Object.keys(sortedData[0]).map((key) => (
                        <th
                          key={key}
                          onClick={() => sortData(key)}
                          className="px-4 py-3 bg-background text-text text-xs font-semibold uppercase tracking-wider text-left border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          {key}
                          {sortConfig.key === key && (
                            <span className="ml-1 text-accent">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((row, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {Object.values(row).map((value, i) => (
                          <td
                            key={i}
                            className="px-4 py-3 text-sm text-text border-b border-gray-200"
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Chart Selection Section */}
              <div className="mt-6 bg-background border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-medium text-secondary mb-4">
                  Visualize Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="xAxis"
                      className="block text-sm font-medium text-text uppercase tracking-wide mb-2"
                    >
                      X-Axis
                    </label>
                    <select
                      id="xAxis"
                      value={xAxis}
                      onChange={(e) => setXAxis(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                    >
                      <option value="">Select X-Axis</option>
                      {sortedData[0] &&
                        Object.keys(sortedData[0]).map((key) => (
                          <option key={key} value={key}>
                            {key}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="yAxis"
                      className="block text-sm font-medium text-text uppercase tracking-wide mb-2"
                    >
                      Y-Axis
                    </label>
                    <select
                      id="yAxis"
                      value={yAxis}
                      onChange={(e) => setYAxis(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                    >
                      <option value="">Select Y-Axis</option>
                      {sortedData[0] &&
                        Object.keys(sortedData[0]).map((key) => (
                          <option key={key} value={key}>
                            {key}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="chartType"
                      className="block text-sm font-medium text-text uppercase tracking-wide mb-2"
                    >
                      Chart Type
                    </label>
                    <select
                      id="chartType"
                      value={chartType}
                      onChange={(e) => setChartType(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                    >
                      <option value="bar">Bar (2D)</option>
                      <option value="line">Line (2D)</option>
                      <option value="pie">Pie (2D)</option>
                      <option value="scatter">Scatter (2D)</option>
                      <option value="3d-bar">3D Bar</option>
                      <option value="3d-scatter">3D Scatter</option>
                    </select>
                  </div>
                </div>
                {xAxis && yAxis && (
                  <div className="h-96 border border-gray-200 rounded-xl p-4 bg-white shadow-inner">
                    {renderChart()}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 text-sm">
              No data available in this entry.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DataView;
