import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setAuthToken } from "../../utils/auth";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      setAuthToken(res.data.token, res.data.role);
      localStorage.setItem("userName", res.data.name); // Store the name in localStorage
      setSuccess("Login Successful! Redirecting...");
      setTimeout(() => {
        navigate(res.data.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
      }, 1000);
    } catch (error) {
      console.error("Login error:", error.response?.data || error);
      setError(error.response?.data?.message || "Login failed! Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <center><h3>Welcome To BIT Dashboard..!</h3></center>
        <h2 className="login-heading">Login Page</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="login-input"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="login-input"
            required
          />
          <button type="submit" className="login-btn">Login</button>
        </form>
        <p className="login-switch-text">
          Not registered? <a href="/register" className="login-link">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;