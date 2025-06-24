const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const AuthRouter = require("./Routes/AuthRouter");
const ProductRouter = require("./Routes/ProductRouter");
const ExcelData = require("./Models/ExcelData");
const excelRoutes = require("./Routes/Excel");
const chartRoutes = require("./Routes/Chart");
const adminRoutes = require("./Routes/AdminRoutes");

require("dotenv").config();
require("./Models/db");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Multer Configuration for Excel File Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /xls|xlsx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const allowedMimetypes = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  const mimetype = allowedMimetypes.includes(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only Excel files (.xls, .xlsx) are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Routes
app.get("/ping", (req, res) => {
  res.send("PONG");
});

// File Upload Route with Excel Parsing and MongoDB Storage
app.post("/api/upload-excel", upload.single("excelFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded or invalid file type",
      });
    }

    // Parse the Excel file
    const workbook = XLSX.readFile(req.file.path);

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
      _id: req.userId,
      data: filteredData,
      filename: req.file.originalname, // Save the original filename
    });
    await excelData.save();

    try {
      fs.unlinkSync(req.file.path);
    } catch (deleteError) {
      console.warn("Warning: Could not delete file:", deleteError.message);
    }

    res.status(200).json({
      success: true,
      message:
        "Excel file uploaded, processed, and saved to database successfully",
      data: filteredData,
    });
  } catch (error) {
    console.error("Error in /api/upload-excel:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});

// Route to Fetch a Single Excel Data Entry by ID
app.get("/api/get-excel-data/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const dataEntry = await ExcelData.findById(id);
    if (!dataEntry) {
      return res.status(404).json({
        success: false,
        message: "Data entry not found",
      });
    }
    res.status(200).json({
      success: true,
      data: dataEntry,
    });
  } catch (error) {
    console.error("Error in /api/get-excel-data/:id:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});

app.use("/api", require("./Routes/Excel"));

// Existing Routes
app.use("/auth", AuthRouter);
app.use("/products", ProductRouter);
app.use("/api/excel", excelRoutes);
app.use("/api", chartRoutes);
app.use("/api", adminRoutes);

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
