const mongoose = require("mongoose");

const analysisHistorySchema = new mongoose.Schema({
  xAxis: String,
  yAxis: String,
  chartType: String,
  fileName: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const excelDataSchema = new mongoose.Schema({
  filename: { type: String, required: true }, // ✅ Make sure this exists
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  data: { type: Array, required: true },
  analysisHistory: [
    {
      chartType: String,
      xAxis: String,
      yAxis: String,
      fileName: String, // optional: if you want to store it in sub-doc too
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("ExcelData", excelDataSchema);
