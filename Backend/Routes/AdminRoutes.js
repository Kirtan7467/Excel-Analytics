const express = require("express");
const router = express.Router();
const authenticateToken = require("../Middlewares/authenticateToken");
const verifyAdmin = require("../Middlewares/verifyAdmin");
const User = require("../Models/User");

router.get("/admin/get-users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false }).select("-password");
    res.json({ success: true, data: users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
});

router.delete("/admin/delete-user/:id", verifyAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedUser = await User.findOneAndDelete({
      _id: userId,
      isAdmin: false,
    });

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found or cannot delete admin users.",
      });
    }

    res.json({ success: true, message: "User deleted successfully." });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ success: false, message: "Error deleting user." });
  }
});
// Get total users (excluding admins)
router.get("/admin/user/count", verifyAdmin, async (req, res) => {
  try {
    const count = await User.countDocuments({ isAdmin: false });
    res.json({ success: true, count });
  } catch (err) {
    console.error("Error getting user count:", err);
    res
      .status(500)
      .json({ success: false, message: "Error getting user count" });
  }
});

module.exports = router;
