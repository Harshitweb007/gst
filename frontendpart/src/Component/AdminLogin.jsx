import { useState } from "react";

import { API_URL } from "../config/api";

const BASE_URL = `${API_URL}/api`;

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // ✅ ADMIN ROLE CHECK (SAFE)
      const role = data.role || data.user?.role;

      if (role !== "admin") {
        setError("You are not an admin");
        setLoading(false);
        return;
      }

      // 🔐 SAVE TOKEN
      localStorage.setItem("token", data.token);

      console.log("✅ ADMIN LOGIN SUCCESS");

      onLogin();
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleLogin}>
        <h2 style={styles.title}>Admin Login</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          style={styles.input}
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

/* 🎨 STYLES */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f172a,#1e293b)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, Segoe UI, sans-serif"
  },
  card: {
    background: "#ffffff",
    padding: "42px",
    borderRadius: 22,
    width: 360,
    boxShadow: "0 30px 70px rgba(0,0,0,0.35)",
    textAlign: "center"
  },
  title: {
    marginBottom: 22,
    fontWeight: 700
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    marginBottom: 14,
    borderRadius: 10,
    border: "1px solid #cbd5f5",
    fontSize: 14
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 10
  },
  error: {
    color: "#ef4444",
    marginBottom: 12,
    fontSize: 14
  }
};
