// routes/users.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, "your_jwt_secret", (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    // Assuming you're using a database like MongoDB
    const user = await UserModel.findById(req.params.id); // Fetch user by ID
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user data" });
  }
});

module.exports = router;
