const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../Models/Users");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
        success: false,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Invalid email format", success: false });
    }

    const user = await UserModel.findOne({ email });
    if (user) {
      return res
        .status(409)
        .json({ message: "User already exists", success: false });
    }

    const userModel = new UserModel({ name, email, password, isAdmin: false });
    userModel.password = await bcrypt.hash(password, 10);
    await userModel.save();

    // Generate token with user ID
    const token = jwt.sign({ id: userModel._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log("Generated token:", token); // Debug log
    console.log("Token payload:", { id: userModel._id }); // Debug log

    res.status(201).json({
      message: "Signup Successfully",
      success: true,
      isAdmin: false,
      token,
      user: { id: userModel._id, name: userModel.name, email: userModel.email },
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Ensure other functions (adminSignup, login, adminLogin) also include id in the token payload
const adminSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
        success: false,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Invalid email format", success: false });
    }

    const user = await UserModel.findOne({ email });
    if (user) {
      return res
        .status(409)
        .json({ message: "User already exists", success: false });
    }

    const userModel = new UserModel({ name, email, password, isAdmin: true });
    userModel.password = await bcrypt.hash(password, 10);
    await userModel.save();

    const token = jwt.sign({ id: userModel._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log("Generated token (admin):", token);
    console.log("Token payload (admin):", { id: userModel._id });

    res.status(201).json({
      message: "Admin Signup Successfully",
      success: true,
      isAdmin: true,
      token,
      user: { id: userModel._id, name: userModel.name, email: userModel.email },
    });
  } catch (err) {
    console.error("Admin signup error:", err.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid email or password", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid email or password", success: false });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log("Generated token (login):", token);
    console.log("Token payload (login):", { id: user._id });

    res.status(200).json({
      message: "Login successful",
      success: true,
      isAdmin: user.isAdmin,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid email or password", success: false });
    }

    if (!user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied: Not an admin", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid email or password", success: false });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, // Include role from the user document
      process.env.JWT_SECRET || "your_jwt_secret", // Ensure JWT_SECRET is set
      { expiresIn: "12h" }
    );
    console.log("Generated token (admin login):", token);
    console.log("Token payload (admin login):", { id: user._id });

    res.status(200).json({
      message: "Admin login successful",
      success: true,
      isAdmin: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Admin login error:", err.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

module.exports = { signup, adminSignup, login, adminLogin };
