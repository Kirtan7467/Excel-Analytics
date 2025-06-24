const express = require("express");
const router = express.Router();
const ExcelData = require("../Models/ExcelData");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const XLSX = require("xlsx");
const mongoose = require("mongoose");
const { verifyToken } = require("../Middlewares/Auth");
const AnalysisHistory = require("../Models/AnalysisHistory");

// Configure Multer with memory storage and file type validation
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const fileExt = file.originalname.toLowerCase();
    if (!fileExt.endsWith(".xls") && !fileExt.endsWith(".xlsx")) {
      console.log("Invalid file extension:", fileExt);
      return cb(new Error("Only .xls and .xlsx files are allowed"));
    }

    const allowedMimeTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      console.log("Invalid MIME type:", file.mimetype);
      return cb(
        new Error(
          "Invalid file type. Only Excel files (.xls, .xlsx) are allowed"
        )
      );
    }

    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.post(
  "/upload-excel/:user_id",
  upload.single("excelFile"),
  async (req, res) => {
    try {
      console.log("Request headers:", req.headers);

      // Extract and verify JWT token
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        console.log("No Authorization header present");
        return res.status(401).json({
          success: false,
          message: "Unauthorized: No Authorization header provided",
        });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        console.log("No token found in Authorization header");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: No token provided" });
      }
      console.log("Token received in backend:", token);

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
      } catch (jwtError) {
        console.error("JWT verification error:", jwtError.message);
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Invalid token",
          error: jwtError.message,
        });
      }

      if (!decoded) {
        console.log("Decoded token is undefined");
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Token decoding failed",
        });
      }

      const tokenUserId = decoded.id || decoded._id || decoded.userId;
      console.log("Extracted user_id from token:", tokenUserId);

      if (!tokenUserId) {
        console.log("User ID not found in token payload", decoded);
        return res.status(401).json({
          success: false,
          message: "Unauthorized: User ID not found in token payload",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(tokenUserId)) {
        console.log("Invalid user_id format from token:", tokenUserId);
        return res
          .status(400)
          .json({ success: false, message: "Invalid user_id format in token" });
      }

      // Get user_id from URL parameter
      const urlUserId = req.params.user_id;
      console.log("User ID from URL:", urlUserId);

      if (!mongoose.Types.ObjectId.isValid(urlUserId)) {
        console.log("Invalid user_id format from URL:", urlUserId);
        return res
          .status(400)
          .json({ success: false, message: "Invalid user_id format in URL" });
      }

      // Compare user_id from URL with user_id from token
      if (urlUserId !== tokenUserId) {
        console.log(
          "User ID mismatch: URL user_id does not match token user_id"
        );
        return res
          .status(403)
          .json({ success: false, message: "Forbidden: User ID mismatch" });
      }

      if (!req.file) {
        console.log("No file uploaded in request");
        return res.status(400).json({
          success: false,
          message: "No file uploaded or invalid file type",
        });
      }
      console.log("File received:", req.file.originalname);

      // Parse the Excel file
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Excel file is empty or has no sheets",
        });
      }

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const data = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
        blankrows: false,
      });

      if (data.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Excel file contains no data",
        });
      }

      const headers = data[0];
      const rows = data.slice(1).map((row) => {
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index] !== undefined ? row[index] : "";
        });
        return rowData;
      });

      const filteredData = rows.filter((row) =>
        Object.values(row).some((value) => value !== "")
      );

      if (filteredData.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Excel file contains no valid data after filtering",
        });
      }

      const excelData = new ExcelData({
        data: filteredData,
        filename: req.file.originalname,
        user_id: tokenUserId,
      });
      await excelData.save();
      console.log("File saved to database:", req.file.originalname);

      res.status(200).json({
        success: true,
        message:
          "Excel file uploaded, processed, and saved to database successfully",
        data: filteredData,
        user_id: tokenUserId,
      });
    } catch (error) {
      console.error("Error in /api/upload-excel:", error.message);
      if (error instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: `File upload error: ${error.message}`,
        });
      }
      if (
        error.message === "Only .xls and .xlsx files are allowed" ||
        error.message ===
          "Invalid file type. Only Excel files (.xls, .xlsx) are allowed"
      ) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res
        .status(500)
        .json({ success: false, message: "Server error: " + error.message });
    }
  }
);

router.get("/get-excel-data", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No user ID" });
    }

    const files = await ExcelData.find({ user_id: userId }).sort({
      uploadedAt: -1,
    });
    res.status(200).json({ success: true, data: files });
  } catch (error) {
    console.error("Error fetching user files:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/log-analysis-action", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { fileId, details } = req.body;

    if (!fileId || !details?.chartType || !details?.xAxis || !details?.yAxis) {
      return res
        .status(400)
        .json({ success: false, message: "Missing chart details" });
    }

    // ✅ Fetch file from ExcelData
    const file = await ExcelData.findOne({ _id: fileId, user_id: userId });

    if (!file || !file.filename) {
      return res.status(404).json({
        success: false,
        message: "File not found or missing filename",
      });
    }

    // ✅ Ensure filename is present
    console.log("Fetched file filename:", file.filename);

    // Optional: store in DB if needed
    file.analysisHistory.push({
      chartType: details.chartType,
      xAxis: details.xAxis,
      yAxis: details.yAxis,
      fileName: file.filename, // 👈 Save file name in history
      createdAt: new Date(),
    });

    await file.save();

    res.status(200).json({
      success: true,
      message: "Chart analysis logged successfully",
      payload, // 👈 include payload in response
    });
  } catch (err) {
    console.error("Chart logging error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/delete-excel/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const deleted = await ExcelData.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your_jwt_secret",
    (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid token" });
      }
      req.user = user;
      next();
    }
  );
};
router.get("/count", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No user ID" });
    }

    const count = await ExcelData.countDocuments({ user_id: userId });

    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Error fetching file count:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching file count",
    });
  }
});

router.get("/get-analysis-history", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // Fetch all ExcelData documents for the user
    const userFiles = await ExcelData.find({ user_id: userId });

    // Flatten the analysisHistory and attach filename from parent ExcelData
    const allHistory = userFiles.flatMap((file) =>
      (file.analysisHistory || []).map((entry) => ({
        _id: entry._id,
        fileId: file._id.toString(), // Parent file's _id
        fileName: file.filename || "N/A", // ✅ Pull fileName from ExcelData
        xAxis: entry.xAxis,
        yAxis: entry.yAxis,
        chartType: entry.chartType,
        createdAt: entry.createdAt,
      }))
    );

    res.json({ success: true, data: allHistory });
  } catch (error) {
    console.error("Error fetching analysis history:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Save analysis history to its own collection
router.post("/save-analysis-history", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { fileId, xAxis, yAxis, chartType, chartData, scatterData } =
      req.body;

    if (!fileId || !xAxis || !yAxis || !chartType) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // ✅ Fetch the Excel file to get its filename
    const file = await ExcelData.findById(fileId);
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "Excel file not found" });
    }

    // ✅ Create a new analysis history entry with fileName from ExcelData
    const newHistory = new AnalysisHistory({
      userId,
      fileId,
      fileName: file.filename, // From ExcelData
      chartType,
      xAxis,
      yAxis,
      chartData,
      scatterData,
    });

    await newHistory.save();

    return res
      .status(201)
      .json({ success: true, message: "Analysis history saved successfully" });
  } catch (error) {
    console.error("Error saving analysis history:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete a specific analysis history record
router.delete(
  "/delete-analysis-history/:fileId/:entryId",
  verifyToken,
  async (req, res) => {
    try {
      const userId = req.user.id || req.user._id;
      const { fileId, entryId } = req.params;

      // Find the Excel file for the authenticated user
      const file = await ExcelData.findOne({ _id: fileId, user_id: userId });

      if (!file) {
        return res
          .status(404)
          .json({ success: false, message: "File not found or unauthorized" });
      }

      // Filter out the entry with matching _id
      const initialLength = file.analysisHistory.length;
      file.analysisHistory = file.analysisHistory.filter(
        (entry) => entry._id.toString() !== entryId
      );

      if (file.analysisHistory.length === initialLength) {
        return res.status(404).json({
          success: false,
          message: "Analysis history entry not found",
        });
      }

      await file.save();

      res.json({ success: true, message: "Analysis history entry deleted" });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

module.exports = router;
