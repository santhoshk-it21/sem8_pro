import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    password: "",
    adminKey: "",
  });
  const [success, setSuccess] = useState(""); // Added success state
  const [error, setError] = useState(""); // Added error state for better feedback
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(""); // Clear success message on input change
    setError(""); // Clear error message on input change
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, phone, department, password } = formData;

    if (!name || !email || !phone || !department || !password) {
      setError("All required fields must be filled.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", formData);
      setSuccess(<h5>"You have registered successfully! Redirecting to login..."</h5>); // Set success message
      console.log("Registered as:", response.data.role); // Debug role
      setTimeout(() => {
        navigate("/login"); // Navigate after a delay to show the success message
      }, 2000); // 1-second delay
    } catch (error) {
      console.error("Registration error:", error.response?.data || error);
      setError(error.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <center><h3>Welcome To BIT Dashboard..!</h3></center>
        <h2 className="register-heading">Register</h2>
        {success && <div className="success-message">{success}</div>} {/* Display success message */}
        {error && <div className="error-message">{error}</div>} {/* Display error message */}
        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="register-input"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="register-input"
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="register-input"
            required
          />
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            className="register-input"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="register-input"
            required
          />
          <input
            type="text"
            name="adminKey"
            placeholder="Admin Key (optional)"
            value={formData.adminKey}
            onChange={handleChange}
            className="register-input"
          />
          <button type="submit" className="register-btn">Register</button>
        </form>
        <p className="register-switch-text">
          Already have an account? <a href="/login" className="register-link">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;