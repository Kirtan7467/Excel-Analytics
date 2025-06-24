// backend/routes/chartHistory.js
const express = require("express");
const router = express.Router();
const ChartHistory = require("../Models/AnalysisHistory ");
const authenticate = require("../middleware/authenticate");

// Save chart history
router.post("/", authenticate, async (req, res) => {
  try {
    const { fileId, fileName, chartType, xAxis, yAxis } = req.body;
    const chartHistory = new ChartHistory({
      userId: req.user._id,
      fileId,
      fileName,
      chartType,
      xAxis,
      yAxis,
      timestamp: new Date(),
    });
    await chartHistory.save();
    res.json({ success: true, data: chartHistory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Fetch chart history
router.get("/", authenticate, async (req, res) => {
  try {
    const history = await ChartHistory.find({ userId: req.user._id }).sort({
      timestamp: -1,
    });
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete chart history
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const history = await ChartHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!history) {
      return res
        .status(404)
        .json({ success: false, message: "Chart history not found" });
    }
    res.json({ success: true, message: "Chart history deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
