import React, { useState, useEffect } from "react";
import { logout } from "../../utils/auth";
import { FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa"; 
import axios from "axios";
import "./AdminNavbar.css";

const AdminNavbar = () => {
  const role = localStorage.getItem("role");
  const [isOpen, setIsOpen] = useState(false); 
  const [userImage, setUserImage] = useState(null); 

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
   
    const fetchProfileImage = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUserImage(res.data.image ? `data:image/jpeg;base64,${res.data.image}` : null);
      } catch (error) {
        console.error("Error fetching profile image:", error);
      }
    };
    fetchProfileImage();
  }, []);

  return (
    <div className="navbar">
      <a href="/" className="navbar-title">Consumable Management</a>
      <button className="menu-toggle" onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      <div className={`navbar-links ${isOpen ? "open" : ""}`}>
        {role === "user" && <a href="/user-dashboard" className="nav-link">User Dashboard</a>}
        {role === "admin" && <a href="/admin-dashboard" className="nav-link">Admin Dashboard</a>}
        
        {/* Display profile image in navbar */}
        {userImage && (
          <div className="navbar-profile">
            <img src={userImage} alt="User Profile" className="navbar-profile-image" />
          </div>
        )}

        <button onClick={logout} className="logout-btn">
          <FaSignOutAlt className="logout-icon" /> Logout
        </button>
      </div>
    </div>
  );
};

export default AdminNavbar;
