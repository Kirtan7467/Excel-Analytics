const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    console.log("Decoded token:", decoded); // Debug log
    req.user = {
      userId: decoded.id || decoded._id || decoded.userId,
      isAdmin: decoded.isAdmin,
    };
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: "Invalid token" });
  }
};

module.exports = authenticateToken;
