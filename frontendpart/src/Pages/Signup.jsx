import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config/api";

export default function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      return setError("All fields are required");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setSuccess(true);

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
      });

      setTimeout(() => navigate("/signin"), 2000);
    } catch (err) {
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
      {/* 🔐 ADMIN LOGIN LINK (SIDE) */}
      <div className="absolute top-6 right-6">
        <Link
          to="/admin"
          className="px-5 py-2 rounded-full bg-black text-white text-sm font-semibold hover:opacity-80 transition"
        >
          Admin Login
        </Link>
      </div>

      {/* SIGNUP CARD */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Create Account
        </h2>

        <p className="text-center text-gray-500 mt-2 mb-6">
          Join us and get started 🚀
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 text-red-700 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-100 text-green-700 px-4 py-2 text-sm">
            Account created successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            id="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />

          <input
            id="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />

          <input
            id="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />

          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-yellow-600 font-medium hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
