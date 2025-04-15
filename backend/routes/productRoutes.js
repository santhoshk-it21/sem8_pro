// backend/routes/productRoutes.js
const express = require("express");
const multer = require("multer");
const { getProducts, addProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", authMiddleware, getProducts);
router.post("/", authMiddleware, adminMiddleware, upload.single("image"), addProduct);
router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;