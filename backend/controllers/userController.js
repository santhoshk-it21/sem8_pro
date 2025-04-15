// backend/controllers/userController.js
const User = require("../models/User");

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -image");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

const addUser = async (req, res) => {
  try {
    const { name, email, phone, department, status } = req.body;
    const user = new User({
      name,
      email,
      password: "default123", // Default password; enhance security in production
      phone,
      department,
      status: status || "Active",
      role: "user",
    });
    await user.save();
    const savedUser = await User.findById(user._id).select("-password");
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: "Error adding user", error });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: "Error updating user", error });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting user", error });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({
      ...user._doc,
      image: user.image ? user.image.toString("base64") : null,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address, department } = req.body;
    const updateData = { name, email, phone, address, department };
    if (req.file) updateData.image = req.file.buffer;
    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select("-password");
    res.json({
      ...user._doc,
      image: user.image ? user.image.toString("base64") : null,
    });
  } catch (error) {
    res.status(400).json({ message: "Error updating profile", error });
  }
};



module.exports = { getUsers, addUser, updateUser, deleteUser, getProfile, updateProfile };