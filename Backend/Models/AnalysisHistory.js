const mongoose = require("mongoose");

const analysisHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  fileId: { type: String, required: true },
  fileName: { type: String, required: true },
  chartType: { type: String, required: true },
  xAxis: { type: String, required: true },
  yAxis: { type: String, required: true },
  chartData: { type: Object },
  scatterData: { type: Object },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AnalysisHistory", analysisHistorySchema);
