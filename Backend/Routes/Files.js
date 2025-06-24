// routes/files.js
const express = require("express");
const router = express.Router();
const ExcelData = require("../Models/ExcelData");
const jwt = require("jsonwebtoken");

// GET /api/files/count - Get the count of files uploaded by the user
router.get("/count", async (req, res) => {
  try {
    // Extract token from Authorization header
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided" });
    }

    // Verify token and extract userId
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError.message);
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Invalid token" });
    }

    const userId = decoded.id; // Adjust this if your token uses a different field (e.g., decoded.userId)
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found in token",
      });
    }

    // Count the number of ExcelData documents for this user
    const count = await ExcelData.countDocuments({ userId });

    res.status(200).json({ success: true, count });
  } catch (err) {
    console.error("Error counting files:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
