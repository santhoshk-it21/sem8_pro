const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  purpose: { type: String, required: true },
  isReturnable: { type: Boolean, default: false },
  fromDate: { type: Date, required: true },
  toDate: { type: Date },
  requestDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  trackingStatus: { type: String, enum: ["Pending", "Shipped", "Delivered"], default: "Pending" },
  isReturned: { type: Boolean, default: false },
  rejectionReason: { type: String } // New field for rejection reason
});

module.exports = mongoose.model("Request", requestSchema);