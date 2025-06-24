const express = require("express");
const router = express.Router();
const verifyToken = require("../Middlewares/verifyToken");
const mongoose = require("mongoose");
const ExcelData = require("../Models/ExcelData"); // ✅ Correct model
const ChartModel = require("../Models/Chart");
const AnalysisHistory = require("../Models/AnalysisHistory");

// Save chart data
router.post("/save-chart", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const { chartData, scatterData, xAxis, yAxis, generatedAt, fileName } =
      req.body;

    const newChart = new ChartModel({
      chartData,
      scatterData,
      xAxis,
      yAxis,
      generatedAt,
      userId,
      fileName,
    });

    await newChart.save();
    res.json({ success: true, message: "Chart saved successfully" });
  } catch (err) {
    console.error("Save chart error:", err);
    res.status(500).json({ success: false, message: "Failed to save chart" });
  }
});

// Get all stored charts
router.get("/get-charts", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const charts = await ChartModel.find({ userId });
    res.json({ success: true, data: charts });
  } catch (err) {
    console.error("Get charts error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch charts" });
  }
});

// ✅ Save chart history to ExcelData.analysisHistory
router.post("/chart-history", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let { fileId, fileName, xAxis, yAxis, chartType } = req.body;

    // Validate fileId
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid fileId format" });
    }

    const file = await ExcelData.findOne({ _id: fileId, user_id: userId });
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "Excel file not found" });
    }

    // Use actual filename from ExcelData
    fileName = file.filename;

    const newEntry = new AnalysisHistory({
      userId,
      fileId,
      fileName,
      xAxis,
      yAxis,
      chartType,
    });

    await newEntry.save();

    res.status(201).json({ success: true, message: "History saved" });
  } catch (err) {
    console.error("Chart history save error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
