import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Sidebar from "./Sidebar";
import AdminSidebar from "./AdminSidebar";
import "./Chart.css";

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

function ThreeDBarChart({ chartData, xAxis, yAxis }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!chartData || !chartData.labels || !chartData.datasets) return;

    const labels = chartData.labels;
    const data = chartData.datasets[0].data;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    const controls = new OrbitControls(camera, renderer.domElement);

    scene.background = new THREE.Color(0xf0f4f8);
    camera.position.set(10, 10, 20);
    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(10, 10, 10);
    scene.add(light);

    const spacing = 1;
    const maxHeight = Math.max(...data, 1);
    const barWidth = 0.5;
    const barDepth = 0.5;

    data.forEach((value, i) => {
      const height = (value / maxHeight) * 8;
      const geometry = new THREE.BoxGeometry(barWidth, height, barDepth);
      const material = new THREE.MeshPhongMaterial({ color: 0x0d7377 });
      const bar = new THREE.Mesh(geometry, material);
      bar.position.set(
        i * spacing - (data.length * spacing) / 2,
        height / 2,
        0
      );
      scene.add(bar);
    });

    const resize = () => {
      const container = containerRef.current;
      if (container) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    window.addEventListener("resize", resize);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (containerRef.current) resizeObserver.unobserve(containerRef.current);
      renderer.dispose();
    };
  }, [chartData]);

  return (
    <div ref={containerRef} className="three-d-container">
      <canvas ref={canvasRef} className="three-d-chart"></canvas>
    </div>
  );
}

function Chart() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");
  const {
    chartData: initialChartData,
    scatterData: initialScatterData,
    xAxis,
    yAxis,
    chartType: chartTypeFromNav,
    fileId,
    fileName,
  } = location.state || {};

  const chartRef = useRef(null);
  const [chartData, setChartData] = useState(initialChartData || null);
  const [scatterData, setScatterData] = useState(initialScatterData || null);
  const [chartType, setChartType] = useState(chartTypeFromNav || "bar");

  useEffect(() => {
    const fetchChartData = async () => {
      if (!fileId || !xAxis || !yAxis) return;

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `https://excel-analytics-srom.onrender.com/api/get-excel-data/${fileId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await res.json();

        if (result.success && result.data) {
          const rawData = result.data.data;

          if (!rawData[0][xAxis] || !rawData[0][yAxis]) {
            console.error("Invalid axes", xAxis, yAxis);
            return;
          }

          const labels = rawData.map((row) => row[xAxis]);
          const yValues = rawData.map((row) => row[yAxis]);

          setChartData({
            labels,
            datasets: [
              {
                label: yAxis,
                data: yValues,
                backgroundColor: "rgba(13, 115, 119, 0.6)",
                borderColor: "rgba(13, 115, 119, 1)",
                borderWidth: 1,
              },
            ],
          });

          setScatterData({
            datasets: [
              {
                label: `${yAxis} vs ${xAxis}`,
                data: rawData.map((row) => ({ x: row[xAxis], y: row[yAxis] })),
                backgroundColor: "rgba(13, 115, 119, 0.6)",
              },
            ],
          });
        }
      } catch (err) {
        console.error("Error fetching chart data:", err.message);
      }
    };

    fetchChartData();
  }, [fileId, xAxis, yAxis]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `${yAxis} vs ${xAxis}` },
    },
  };

  const renderChart = () => {
    switch (chartType || "bar") {
      case "bar":
        return <Bar data={chartData} options={options} ref={chartRef} />;
      case "line":
        return <Line data={chartData} options={options} ref={chartRef} />;
      case "pie":
        return <Pie data={chartData} options={options} ref={chartRef} />;
      case "scatter":
        return <Scatter data={scatterData} options={options} ref={chartRef} />;
      case "3d-bar":
        return (
          <ThreeDBarChart chartData={chartData} xAxis={xAxis} yAxis={yAxis} />
        );
      default:
        return <Bar data={chartData} options={options} ref={chartRef} />;
    }
  };

  const downloadChartAsPNG = () => {
    const canvas =
      chartType === "3d-bar"
        ? document.querySelector(".three-d-chart")
        : document.querySelector(".chart-container canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `chart-${xAxis}-vs-${yAxis}.png`;
    a.click();
  };

  const downloadChartAsPDF = async () => {
    const chartElement = document.querySelector(".chart-container");
    if (!chartElement) return;
    const canvas = await html2canvas(chartElement);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`chart-${xAxis}-vs-${yAxis}.pdf`);
  };

  if (!chartData || !scatterData || !xAxis || !yAxis) {
    return (
      <div className="chart-wrapper">
        {role === "admin" ? <AdminSidebar /> : <Sidebar />}
        <div className="chart-main-content">
          <h2 className="chart-title">No Chart Data Available</h2>
          <p className="chart-message">
            Please go back to Files page and select a chart to view.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-wrapper">
      {role === "admin" ? <AdminSidebar /> : <Sidebar />}
      <div className="chart-main-content">
        <h2 className="chart-title">Chart Visualization</h2>
        <div className="chart-controls">
          <div className="chart-type-selector">
            <label htmlFor="chartType">Chart Type</label>
            <select
              id="chartType"
              value={chartType || "bar"}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="bar">Bar (2D)</option>
              <option value="line">Line (2D)</option>
              <option value="pie">Pie (2D)</option>
              <option value="scatter">Scatter (2D)</option>
              <option value="3d-bar">Bar (3D)</option>
            </select>
          </div>
          <div className="download-buttons">
            <button onClick={downloadChartAsPNG}>Download PNG</button>
            <button onClick={downloadChartAsPDF}>Download PDF</button>
          </div>
        </div>
        <div className="chart-container">{renderChart()}</div>
        <button
          onClick={() => navigate(role === "admin" ? "/admin-files" : "/files")}
        >
          Back to Files
        </button>
      </div>
    </div>
  );
}

export default Chart;
