// backend/controllers/productController.js
const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    // Convert Buffer to base64 for frontend display
    const productsWithImage = products.map(product => ({
      ...product._doc,
      image: product.image ? product.image.toString("base64") : null,
    }));
    res.json(productsWithImage);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

const addProduct = async (req, res) => {
  try {
    const { productId, name, stockRemaining } = req.body;
    const image = req.file ? req.file.buffer : null; // Get image from multer
    const product = new Product({ productId, name, stockRemaining, image });
    await product.save();
    res.status(201).json({
      ...product._doc,
      image: product.image ? product.image.toString("base64") : null,
    });
  } catch (error) {
    res.status(400).json({ message: "Error adding product", error });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { productId, name, stockRemaining } = req.body;
    const updateData = { productId, name, stockRemaining };
    if (req.file) updateData.image = req.file.buffer; // Only update image if new file uploaded
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({
      ...product._doc,
      image: product.image ? product.image.toString("base64") : null,
    });
  } catch (error) {
    res.status(400).json({ message: "Error updating product", error });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting product", error });
  }
};

module.exports = { getProducts, addProduct, updateProduct, deleteProduct };