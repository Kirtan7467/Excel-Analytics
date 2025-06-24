const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer"); // For file uploads

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, "your_jwt_secret", (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Simulated database (replace with MongoDB or your database)
const userFiles = {};

// Get file count for the authenticated user
router.get("/count", authenticateToken, (req, res) => {
  const userId = req.user.id; // Assuming the JWT payload contains the user ID
  const files = userFiles[userId] || [];
  res.json({ count: files.length });
});

// Get list of files for the authenticated user
router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const files = userFiles[userId] || [];
  res.json({ files });
});

// Upload a new file
router.post("/upload", authenticateToken, upload.single("file"), (req, res) => {
  const userId = req.user.id;
  const file = { name: req.file.filename };

  if (!userFiles[userId]) userFiles[userId] = [];
  userFiles[userId].push(file);

  res.json({ file });
});

module.exports = router;
