// middlewares/verifyAdmin.js
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Not an admin." });
    }

    req.user = user; // attach full user object if needed
    next();
  } catch (err) {
    console.error("verifyAdmin error:", err.message);
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = verifyAdmin;
