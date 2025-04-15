const User = require("../models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const register = async (req, res) => {
  const { name, email, phone, department, password, adminKey } = req.body;

  if (!name || !email || !phone || !department || !password) {
    return res.status(400).json({ message: "All required fields must be provided" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const role = adminKey === process.env.ADMIN_KEY ? "admin" : "user";
    const user = new User({ name, email, phone, department, password, role });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      role: user.role,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.status === "Blocked") {
      return res.status(403).json({ message: "Your account is blocked" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Include the user's name in the response
    res.json({ 
      token, 
      role: user.role, 
      name: user.name // Added name to the response
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

module.exports = { register, login };