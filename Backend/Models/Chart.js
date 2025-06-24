const mongoose = require("mongoose");

const chartSchema = new mongoose.Schema({
  chartData: { type: Object, required: true },
  scatterData: { type: Object, required: true },
  xAxis: { type: String, required: true },
  yAxis: { type: String, required: true },
  generatedAt: { type: String, required: true },
  userId: { type: String, required: true },
  fileName: { type: String, required: true }, 
});

module.exports = mongoose.model("Chart", chartSchema);
