import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBox, FaTruck, FaCheckCircle, FaUndo, FaArrowLeft, FaDownload } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "./OrderDetails.css";

const OrderDetails = () => {
  const [order, setOrder] = useState(null);
  const { orderId } = useParams();
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const endpoint = role === "admin" ? "/api/requests" : "/api/requests/user";
        const res = await axios.get(`http://localhost:5000${endpoint}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const selectedOrder = res.data.find((o) => o._id === orderId);
        if (selectedOrder) {
          // If the order is rejected, set trackingStatus to "Rejected"
          if (selectedOrder.status === "Rejected") {
            selectedOrder.trackingStatus = "Rejected";
          }
          setOrder(selectedOrder);
        } else {
          navigate("/order-list");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        navigate("/order-list");
      }
    };
    fetchOrder();
  }, [orderId, role, navigate]);

  const handleStatusUpdate = async (newTrackingStatus) => {
    try {
      const isDelivered = newTrackingStatus === "Delivered";
      const isReturnedUpdate = newTrackingStatus === "Returned";
      const trackingStatus = isReturnedUpdate ? "Delivered" : newTrackingStatus;
      const isReturned = isReturnedUpdate ? true : isDelivered ? order.isReturned : false;

      const updateData = { trackingStatus, isReturned };
      await axios.put(
        `http://localhost:5000/api/requests/${order._id}`,
        updateData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setOrder({ ...order, ...updateData });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const formatOrderId = (id) => {
    const shortId = id.slice(-6);
    return `ORD-${shortId.toUpperCase()}`;
  };

  const getTimelineSteps = (order) => {
    if (!order) return [];
    if (order.status === "Rejected") {
      return [
        { status: "Rejected", icon: <FaBox className="timeline-icon rejected" />, isActive: true, isCompleted: false }
      ];
    }
    const steps = [
      { status: "Pending", icon: <FaBox className="timeline-icon pending" />, isActive: order.trackingStatus === "Pending", isCompleted: order.trackingStatus !== "Pending" },
      { status: "Shipped", icon: <FaTruck className="timeline-icon shipped" />, isActive: order.trackingStatus === "Shipped", isCompleted: order.trackingStatus === "Delivered" || order.isReturned },
      { status: "Delivered", icon: <FaCheckCircle className="timeline-icon delivered" />, isActive: order.trackingStatus === "Delivered" && !order.isReturned, isCompleted: order.isReturned },
    ];
    if (order.isReturnable) {
      steps.push({
        status: "Returned",
        icon: <FaUndo className="timeline-icon return" />,
        isActive: order.isReturned,
        isCompleted: false,
      });
    }
    return steps;
  };

  const downloadInvoice = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("BIT Consumable Details Invoice", 20, 20);
    doc.setFontSize(12);
    doc.text(`Order ID: ${formatOrderId(order._id)}`, 20, 40);
    doc.text(`Purchased By: ${order.userId?.username || "User"}`, 20, 50);
    doc.text(`Product: ${order.productId?.name || "Unknown"}`, 20, 60);
    doc.text(`Quantity: ${order.quantity}`, 20, 70);
    doc.text(`Purpose: ${order.purpose}`, 20, 80);
    doc.text(`Returnable: ${order.isReturnable ? "Yes" : "No"}`, 20, 90);
    doc.text(`From Date: ${new Date(order.fromDate).toLocaleDateString()}`, 20, 100);
    doc.text(`To Date: ${order.isReturnable ? new Date(order.toDate).toLocaleDateString() : "N/A"}`, 20, 110);
    doc.text(`Requested On: ${new Date(order.requestDate).toLocaleString()}`, 20, 120);
    doc.text(`Status: ${order.status || "Pending"}`, 20, 130);
    doc.text(`Tracking Status: ${order.trackingStatus || "Pending"}`, 20, 140);
    if (order.status === "Rejected" && order.rejectionReason) {
      doc.text(`Rejection Reason: ${order.rejectionReason}`, 20, 150);
    }
    if (order.isReturnable) {
      doc.text(`Returned: ${order.isReturned ? "Yes" : "No"}`, 20, order.status === "Rejected" ? 160 : 150);
    }
    doc.save(`invoice_${formatOrderId(order._id)}.pdf`);
  };

  if (!order) return <div className="loading">Loading...</div>;

  return (
    <div className="order-details-page">
      <div className="order-details-container">
        <button className="back-btn" onClick={() => navigate("/order-list")}>
          <FaArrowLeft /> Back to Orders
        </button>
        <div className="order-details-header">
          <h2 className="order-details-title">📦Order {formatOrderId(order._id)}</h2>
          <button className="download-btn" onClick={downloadInvoice}>
            <FaDownload /> Download Invoice
          </button>
        </div>
        <div className="details-card">
          <h4>✅Your Order Details</h4>
          <div className="details-info">
            <p><strong>Username:</strong> {order.userId?.username || "User"}</p>
            <p><strong>Product:</strong> {order.productId?.name || "Unknown"}</p>
            <p><strong>Quantity:</strong> {order.quantity}</p>
            <p><strong>Purpose:</strong> {order.purpose}</p>
            <p><strong>Returnable:</strong> {order.isReturnable ? "Yes" : "No"}</p>
            <p><strong>From Date:</strong> {new Date(order.fromDate).toLocaleDateString()}</p>
            <p><strong>To Date:</strong> {order.isReturnable ? new Date(order.toDate).toLocaleDateString() : "N/A"}</p>
            <p><strong>Requested On:</strong> {new Date(order.requestDate).toLocaleString()}</p>
            <p><strong>Status:</strong> {order.status || "Pending"}</p>
            <p><strong>Tracking Status:</strong> {order.trackingStatus || "Pending"}</p>
            {order.status === "Rejected" && order.rejectionReason && (
              <p><strong>Rejection Reason:</strong> {order.rejectionReason}</p>
            )}
            {order.isReturnable && (
              <p><strong>Returned:</strong> {order.isReturned ? "Yes" : "No"}</p>
            )}
          </div>
          {order.status === "Approved" && (role === "admin" || (role === "user" && order.isReturnable)) && (
            <div className="action-buttons">
              {role === "admin" && (
                <>
                  <button
                    onClick={() => handleStatusUpdate("Pending")}
                    className={`status-btn pending ${order.trackingStatus === "Pending" ? "active" : ""}`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("Shipped")}
                    className={`status-btn shipped ${order.trackingStatus === "Shipped" ? "active" : ""}`}
                  >
                    Ready to Deliver
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("Delivered")}
                    className={`status-btn delivered ${order.trackingStatus === "Delivered" && !order.isReturned ? "active" : ""}`}
                  >
                    Delivered
                  </button>
                </>
              )}
              {(role === "admin" || role === "user") && order.isReturnable && (
                <button
                  onClick={() => handleStatusUpdate("Returned")}
                  className={`status-btn return ${order.isReturned ? "active" : ""}`}
                  disabled={order.trackingStatus !== "Delivered" || order.isReturned}
                >
                  {order.isReturned ? "Returned" : "Mark Returned"}
                </button>
              )}
            </div>
          )}
          {order.status !== "Rejected" && order.status === "Approved" && (
            <div
              className={`tracking-timeline ${order.isReturnable ? "returnable" : "non-returnable"}`}
              style={{
                '--step-index': order.isReturnable
                  ? order.isReturned
                    ? 3
                    : order.trackingStatus === "Delivered"
                    ? 2
                    : order.trackingStatus === "Shipped"
                    ? 1
                    : 0
                  : order.trackingStatus === "Delivered"
                  ? 2
                  : order.trackingStatus === "Shipped"
                  ? 1
                  : 0,
              }}
            >
              {getTimelineSteps(order).map((step, index) => (
                <div
                  key={index}
                  className={`timeline-step ${step.isActive ? "active" : step.isCompleted ? "completed" : ""}`}
                >
                  {step.icon}
                  <span>{step.status}</span>
                </div>
              ))}
            </div>
          )}
          {order.status === "Rejected" && (
            <div className="tracking-timeline rejected">
              {getTimelineSteps(order).map((step, index) => (
                <div
                  key={index}
                  className={`timeline-step ${step.isActive ? "active" : step.isCompleted ? "completed" : ""}`}
                >
                  {step.icon}
                  <span>{step.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;