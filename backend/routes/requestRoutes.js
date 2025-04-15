const express = require("express");
const { getRequests, getUserRequests, createRequest, updateRequest } = require("../controllers/requestController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, getRequests);
router.get("/user", authMiddleware, getUserRequests);
router.post("/", authMiddleware, createRequest);
router.put("/:id", authMiddleware, adminMiddleware, updateRequest);

module.exports = router;