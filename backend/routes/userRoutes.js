// backend/routes/userRoutes.js
const express = require("express");
const multer = require("multer");
const { getUsers, addUser, updateUser, deleteUser, getProfile, updateProfile } = require("../controllers/userController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, upload.single("image"), updateProfile);
router.get("/", authMiddleware, adminMiddleware, getUsers);
router.post("/", authMiddleware, adminMiddleware, addUser);
router.put("/:id", authMiddleware, adminMiddleware, updateUser);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

module.exports = router;