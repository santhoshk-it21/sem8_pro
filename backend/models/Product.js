// backend/models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  stockRemaining: { type: Number, required: true, default: 0 },
  image: { type: Buffer }, // Store image as binary data
});

module.exports = mongoose.model("Product", productSchema);