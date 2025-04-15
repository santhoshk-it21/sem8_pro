import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./OrderList.css";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState(""); // Store logged-in user's username
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const endpoint = role === "admin" ? "/api/requests" : "/api/requests/user";
        const res = await axios.get(`http://localhost:5000${endpoint}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const approvedOrders = res.data.filter((order) => order.status === "Approved");
        setOrders(approvedOrders);
        setFilteredOrders(approvedOrders);

        // For users, set the username from the first order or fetch from profile
        if (role === "user" && approvedOrders.length > 0) {
          setUsername(approvedOrders[0].userId?.username || "User");
        } else if (role === "admin") {
          const userRes = await axios.get("http://localhost:5000/api/users/me", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setUsername(userRes.data.username || "Admin");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, [role]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = orders.filter(
      (order) =>
        (order.productId?.name?.toLowerCase() || "").includes(query) ||
        (order.userId?.username?.toLowerCase() || "").includes(query) ||
        order._id.toLowerCase().includes(query) ||
        formatOrderId(order._id).toLowerCase().includes(query)
    );
    setFilteredOrders(filtered);
  };

  const formatOrderId = (id) => {
    const shortId = id.slice(-6);
    return `ORD-${shortId.toUpperCase()}`;
  };

  const handleTrackClick = (orderId) => {
    navigate(`/order-details/${orderId}`);
  };

  return (
    <div className="order-list-page">
      <div className="order-list-header">
        <h2 className="order-list-title">Orders</h2>
        <input
          type="text"
          placeholder="Search by product, username, or order ID"
          value={searchQuery}
          onChange={handleSearch}
          className="order-search-input"
        />
      </div>
      <div className="order-table-container">
        <table className="order-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product Name</th>
              <th>Purchased By</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>{formatOrderId(order._id)}</td>
                  <td>{order.productId?.name || "Unknown"}</td>
                  <td>{role === "user" ? username : order.userId?.username || "Unknown"}</td>
                  <td>
                    <button
                      onClick={() => handleTrackClick(order._id)}
                      className="track-btn"
                    >
                      <FaEye /> Track
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-orders">
                  No approved orders to track yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;