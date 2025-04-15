const Request = require("../models/Request");
const Product = require("../models/Product");

const getRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("userId", "username")
      .populate("productId", "name");
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error });
  }
};

const getUserRequests = async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.user.id })
      .populate("productId", "name")
      .populate("userId", "username");
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user requests", error });
  }
};

const createRequest = async (req, res) => {
  try {
    const request = new Request({ ...req.body, userId: req.user.id });
    const product = await Product.findById(req.body.productId);
    if (request.quantity > product.stockRemaining) {
      return res.status(400).json({ message: "Requested quantity exceeds stock" });
    }
    await request.save();
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: "Error creating request", error });
  }
};

const updateRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const { status, trackingStatus, isReturned, rejectionReason } = req.body;

    // Handle stock adjustments for status changes
    if (status) {
      if (status === "Approved" && request.status !== "Approved") {
        const product = await Product.findById(request.productId);
        if (request.quantity > product.stockRemaining) {
          return res.status(400).json({ message: "Requested quantity exceeds available stock" });
        }
        product.stockRemaining -= request.quantity;
        await product.save();
      } else if (status !== "Approved" && request.status === "Approved") {
        const product = await Product.findById(request.productId);
        product.stockRemaining += request.quantity;
        await product.save();
      }
    }

    // Handle stock restoration for returned items
    if (
      isReturned !== undefined &&
      isReturned &&
      !request.isReturned &&
      request.isReturnable &&
      (trackingStatus === "Delivered" || request.trackingStatus === "Delivered")
    ) {
      const product = await Product.findById(request.productId);
      product.stockRemaining += request.quantity;
      await product.save();
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      {
        ...(status && { status }),
        ...(trackingStatus && { trackingStatus }),
        ...(isReturned !== undefined && { isReturned }),
        ...(rejectionReason && { rejectionReason }) // Add rejection reason if provided
      },
      { new: true }
    )
      .populate("userId", "username")
      .populate("productId", "name");

    res.json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: "Error updating request", error });
  }
};

module.exports = { getRequests, getUserRequests, createRequest, updateRequest };